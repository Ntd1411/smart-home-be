import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/shared/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { type Request } from 'express';
import { LoginDto, LoginResponseDto, LogoutResponseDto, RefreshTokenDto, RefreshTokenResponseDto } from './auth.dto';
import { IsProtected } from 'src/shared/decorators/protected.decorator';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';


@ApiTags("Authentication")
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService){}

  // login
  @Post("login")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Đăng nhập",
    description: "Đăng nhập với username và password"
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
  ): Promise<LoginResponseDto> {
    const ipAddress = request.ip;
    const userAgent = request.get("user-agent");

    return await this.authService.login(loginDto, ipAddress, userAgent);
  }



  // refresh token
  @Post("refresh-token")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Làm mới access token và refresh token",
    description: "Sử dụng refresh token để lấy access và refresh token mới"
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: Request,
  ): Promise<RefreshTokenResponseDto>{
    const ipAddress = request.ip;
    const userAgent = request.get("user-agent");

    return this.authService.refreshToken(refreshTokenDto, ipAddress, userAgent);
  }




  //logout
  @Post("logout")
  @IsProtected()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Đăng xuất",
    description: "Đăng xuất đồng thời thu hồi refresh token"
  })
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<LogoutResponseDto>{
    return await this.authService.logout(refreshTokenDto.refreshToken);
  }


  // lấy người dùng hiện tại
  @Get("me")
  @IsProtected()
  @ApiOperation({
    summary: "Lấy thông tin user từ access token",
  })
  async getCurrentUser(
    @CurrentUser() user: any
  ) {
    return user;
  }

}
