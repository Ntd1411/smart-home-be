import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Tên vai trò',
    example: 'ADMIN',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Mô tả vai trò',
    example: 'Quản trị hệ thống',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Đánh dấu vai trò hệ thống',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isSystemRole?: boolean;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}


export class GetRolesQueryDto {
  @ApiProperty({
    description: 'Số trang',
    example: 1,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng bản ghi trên một trang',
    example: 10,
    required: false,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;


  @IsOptional()
  @Transform(({ obj, key }) => {
    const val = obj[key];
    if (val === 'true' || val === '1' || val === 'yes') return true;
    if (val === 'false' || val === '0' || val === 'no') return false;
    return val;
  })
  @IsBoolean()
  isSystemRole?: boolean;

  @IsOptional()
  @Transform(({ obj, key }) => {
    const val = obj[key];
    if (val === 'true' || val === '1' || val === 'yes') return true;
    if (val === 'false' || val === '0' || val === 'no') return false;
    return val;
  })
  @IsBoolean()
  isActive?: boolean;
}
