import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserEntity } from 'src/database/entities/user.entity';
import { DataSource } from 'typeorm';
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { IRequest } from '../types';
import { RsaKeyManager } from '../utils/RsaKeyManager';

export interface JwtPayload {
  sub: string;
  username: string;
  roles: string[];
  // thời gian phát hành
  iat: number;
  // hạn của token
  exp: number;
}

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly logger = new Logger(JwtGuard.name);

  constructor(
    // lấy public key để verify JWT
    private readonly keyManager: RsaKeyManager,
    // đọc metadata của decorator (@Public())
    private readonly reflector: Reflector,
    // lấy repo để query user
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // nếu có route có @Public(), bỏ qua xác thực -> cho đi thẳng 
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // lấy request và token
    const request = context.switchToHttp().getRequest<IRequest>();
    const token = this.extractTokenFromHeader(request);

    // không có token -> 401
    if (!token) {
      throw new UnauthorizedException('Vui lòng đăng nhập để tiếp tục');
    }

    // giải mã token + xác minh chữ kí bằng public key -> lấy được payload 
    try {
      const payload = jwt.verify(token, this.keyManager.getPublicKeyAccess(), {
        algorithms: ['RS256'],
      }) as JwtPayload;

      const user = await this.dataSource.getRepository(UserEntity).findOne({
        where: { id: payload.sub },
        select: {
          id: true,
          fullName: true,
          username: true,
          roles: {
            id: true,
            name: true,
            isActive: true,
            isSystemRole: true,
            permissions: {
              id: true,
              name: true,
              path: true,
              method: true,
              module: true,
            },
          },
        },
        relations: {
          roles: {
            permissions: true,
          },
        },
        // dùng cache:
        // đầu tiên query -> lấy dữ liệu từ DB và lưu vào cache
        // lần sau -> lấy trực tiếp từ cache, không truy vấn DB nữa
        cache: {
          id: `user:${payload.sub}`,
          milliseconds: 3600000,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Vui lòng đăng nhập để tiếp tục');
      }

      // Gán thông tin user vào request để tiếp tục khâu permission guard
      request.user = {
        id: payload.sub,
        username: payload.username,
        fullName: user.fullName,
        roles: user.roles,
      };


      return true;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(
          'Token đã hết hạn, vui lòng đăng nhập lại',
        );
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(
          'Token không hợp lệ, vui lòng đăng nhập lại',
        );
      } else if (error instanceof ForbiddenException) {
        throw error;
      } else if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        this.logger.error('JWT verification failed:', error);
        throw new UnauthorizedException('Vui lòng đăng nhập để tiếp tục');
      }
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
