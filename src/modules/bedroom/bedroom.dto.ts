import { IsBoolean, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BedRoomStateDto {
  @ApiProperty({ example: true, description: 'Trạng thái của phòng ngủ' })
  @IsBoolean()
  state: boolean;
}

export class ChangeDoorPasswordDto {
  @ApiProperty({
    description: 'Mật khẩu cũ',
    example: 'oldPassword123',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description: 'Mật khẩu mới',
    example: 'newPassword123',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}