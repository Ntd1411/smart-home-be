import { RsaKeyManager } from './../../shared/utils/RsaKeyManager';
import { ConfigService } from './../../shared/services/config.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import {
  LoginDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from './auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/entities/user.entity';
import { DataSource, EntityManager, LessThan, MoreThan, Repository } from 'typeorm';
import { HashingService } from 'src/shared/services/hashing.service';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { RefreshTokenEntity } from 'src/database/entities/refresh-token.entity';

export interface JWTRefreshPayLoad {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokeRepository: Repository<RefreshTokenEntity>,
    private readonly keyManager: RsaKeyManager,
    private readonly hashingService: HashingService,
    private readonly configService: ConfigService,
    private readonly datasource: DataSource,
  ) {}

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponseDto> {
    const { username, password } = loginDto;

    // tìm user theo username
    const user = await this.userRepository.findOne({
      where: { username },
      relations: {
        roles: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Tên đăng nhập hoặc mặt khẩu không hợp lệ',
      );
    }

    console.log("sfdsfsdfdfafafafdfdf")
    console.log(password, user.password, user);

    // Kiểm tra mật khẩu
    const isPasswordValid = this.hashingService.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không hợp lệ');
    }

    // tạo access token và refresh token
    const accessToken = this.generateAccessToken(user);

    // create refresh token
    // store the refresh token into dabase.
    const refreshToken = await this.generateRefreshToken(
      user,
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(
    refreshToken: RefreshTokenDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RefreshTokenResponseDto> {
    // lấy token ra
    const rawRefreshToken = refreshToken.refreshToken;

    // check valid
    if (!rawRefreshToken) {
      throw new UnauthorizedException(
        'Không thực hiện được hành động này vì thiếu refresh token',
      );
    }

    try {
      //verify -> lấy payload
      const payload = jwt.verify(
        rawRefreshToken,
        this.keyManager.getPublicKeyRefresh(),
        {
          algorithms: ['RS256'],
        },
      ) as JWTRefreshPayLoad;

      // Transaction để revoke + tạo refresh token mới
      return await this.datasource.transaction(async (manager) => {
        // check trong database xem có bản ghi nào có userid/refresh token hợp lệ, expiresAt < now, ip/user-agent giống nhau, isRevoked  = false
        const tokenEntity = await manager.findOne(RefreshTokenEntity, {
          where: {
            token: this.hashToken(rawRefreshToken),
            userId: payload.sub,
            ipAddress,
            userAgent,
            isRevoked: false,
            expiresAt: MoreThan(new Date()),
          },
          relations: {
            user: {
              roles: true,
            },
          },
        });

        if (!tokenEntity) {
          throw new UnauthorizedException(
            'Refresh token không hợp lệ hoặc hết hạn',
          );
        }

        // revoke the old refresh.
        await manager.update(
          RefreshTokenEntity,
          { token: this.hashToken(rawRefreshToken) },
          { isRevoked: true },
        );

        // valid thì tạo mới access token và refresh token mới
        // tạo access token và refresh token

        const newAccessToken = this.generateAccessToken(tokenEntity.user);

        // create refresh token
        // store the refresh token into dabase.
        const newRefreshToken = await this.generateRefreshToken(
          tokenEntity.user,
          ipAddress,
          userAgent,
          manager,
        );

        return {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        };
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(
          'Refresh token đã hết hạn, vui lòng đăng nhập lại',
        );
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(
          'Refresh token không hợp lệ, vui lòng đăng nhập lại',
        );
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('Refresh token verification failed:', error);
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }

  async logout(refreshToken: string): Promise<LogoutResponseDto> {
    try {
      // verify refresh token
      jwt.verify(refreshToken, this.keyManager.getPublicKeyRefresh(), {
        algorithms: ['RS256'],
      }) as JWTRefreshPayLoad;

      // thu hồi refresh
      await this.refreshTokeRepository.update(
        {token: this.hashToken(refreshToken)},
        {isRevoked: true}
      );

      return {
        message: "Đăng xuất thành công"
      }

    } catch (error) {
      this.logger.error('Logout failed:', error);
      // Vẫn trả về thành công để không leak thông tin
      return { message: 'Đăng xuất thành công' };
    }
  }

  private generateAccessToken(user: UserEntity): string {
    // mã hóa(sign) dữ liệu bằng private access key.
    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles.map((role) => role.name),
    };

    return jwt.sign(payload, this.keyManager.getPrivateKeyAccess(), {
      algorithm: 'RS256',
      expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES_IN'),
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async generateRefreshToken(
    user: UserEntity,
    ipAddress?: string,
    userAgent?: string,
    manager?: EntityManager,
  ): Promise<string> {
    const jti = crypto.randomUUID();
    const payload = {
      sub: user.id,
      jti,
    };

    // tạo
    const refreshToken = jwt.sign(
      payload,
      this.keyManager.getPrivateKeyRefresh(),
      {
        algorithm: 'RS256',
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN'),
      },
    );

    // lưu refresh token vào database
    const saveRepo = manager
      ? manager.getRepository(RefreshTokenEntity)
      : this.refreshTokeRepository;

    await saveRepo.save({
      token: this.hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(
        Date.now() + this.configService.get('REFRESH_TOKEN_EXPIRES_IN') * 1000,
      ),
      ipAddress,
      userAgent,
    });
    return refreshToken;
  }
}
