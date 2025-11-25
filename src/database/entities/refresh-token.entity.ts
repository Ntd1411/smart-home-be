import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AuditableEntity } from "../base/base.entity";
import { ApiProperty } from "@nestjs/swagger";
import { UserEntity } from "./user.entity";


@Entity()
export class RefreshTokenEntity extends AuditableEntity{
  // token
  @ApiProperty({
    description: "Token",
    example: "abcxyz..."
  })
  @Column({
    type: "text",
    unique: true,
    comment: "đây là refresh token"
  })
  token: string


  // user_id
  @ApiProperty({
    description: "User id",
  })
  @Column({
    name: "user_id",
    comment: "đây là userid"
  })
  userId: string


  // expires_at
  @ApiProperty({
    description: "Thời điểm token hết hạn",
    example: "2025-12-01T10:00:00.000Z"
  })
  @Column({
    name: "expires_at",
    type: "timestamptz",
    comment: "Thời điểm refresh token hết hạn"
  })
  expiresAt: Date


  // is_revoked
  @ApiProperty({
    description: "Token có bị thu hồi hay chưa",
    example: false
  })
  @Column({
    name: "is_revoked",
    type: "boolean",
    default: false,
    comment: "Token đã bị thu hồi chưa"
  })
  isRevoked: boolean


  // ip_address
  @ApiProperty({
    description: "IP đã dùng để tạo hoặc sử dụng token",
    example: "192.168.1.20"
  })
  @Column({
    name: "ip_address",
    type: "varchar",
    length: 45,
    nullable: true,
    comment: "Địa chỉ IP của client"
  })
  ipAddress?: string


  // user_agent
  @ApiProperty({
    description: "User Agent của trình duyệt/device",
    example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
  })
  @Column({
    name: "user_agent",
    type: "text",
    nullable: true,
    comment: "Thông tin user agent"
  })
  userAgent?: string


  @ManyToOne(() => UserEntity,{
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: "user_id"})
  user: UserEntity
}