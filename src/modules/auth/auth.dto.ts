import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from "class-validator"


export class LoginDto {
  // username
  @ApiProperty({
    name: "Tên đăng nhập",
    example: "admin",
  })
  @IsString()
  @IsNotEmpty()
  username: string;



  // password
  @ApiProperty({
    description: "Mật khẩu",
    example: "password123",
  })
  @IsString()
  @IsNotEmpty()
  password: string
}


// response không cần validation
export class LoginResponseDto {
  // token
  @ApiProperty({
    description: "Access token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  accessToken: string;



  // refresh token
  @ApiProperty({
    description: "Refresh token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  // new access token
  @ApiProperty({
    description: "New access token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  accessToken: string;


  // new refresh token
  @ApiProperty({
    description: "New refresh token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  refreshToken: string;
}


export class RefreshTokenDto {
  // refresh token cũ muốn làm mới 
  @ApiProperty({
    description: "New refresh token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}


export class LogoutResponseDto {
  @ApiProperty({
    description: "Thông báo logout thành công",
    example: "Đăng xuất thành công",
  })
  message: string;
}