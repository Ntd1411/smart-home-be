import { ApiHideProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToMany, JoinTable, JoinColumn, ManyToOne } from 'typeorm';
import { AuditableEntity } from '../base/base.entity';
import { Gender } from 'src/shared/enums/gender.enum';
import { Exclude } from 'class-transformer';
import { RoleEntity } from './role.entity';

@Entity('users')
export class UserEntity extends AuditableEntity {
  // username
  @Column({
    comment: 'tên đăng nhập',
    unique: true,
  })
  username: string;

  // password
  @Exclude()
  @ApiHideProperty()
  @Column({
    comment: 'mật khẩu',
  })
  password: string;

  // fullName
  @Column({
    name: 'full_name',
    comment: 'tên đầy đủ',
  })
  fullName: string;

  // gender
  @Column({
    comment: 'giới tính',
    enum: Gender,
    default: Gender.OTHER,
  })
  gender: Gender;

  // dateOfBirth
  @Column({
    name: 'date_of_birth',
    comment: 'ngày, tháng, năm sinh',
    nullable: true,
    type: 'timestamptz',
  })
  dateOfBirth?: Date;

  // phone
  @Column({
    comment: 'số điện thoại',
    length: 20,
    nullable: true,
  })
  phone?: string;

  // email
  @Column({
    comment: 'email',
    nullable: true,
  })
  email?: string;

  // currentAddress
  @Column({
    name: 'current_address',
    comment: 'địa chỉ hiện tại',
    nullable: true,
    type: 'text',
  })
  currentAddress?: string;


  // Many to many to Role
  @ManyToMany(() => RoleEntity, (role) => role.users, {
    cascade: true,
    eager: true
  })

  @JoinTable({
    name: "users_roles",
    joinColumn: {name: "user_id", referencedColumnName: "id"},
    inverseJoinColumn: {name: "role_id", referencedColumnName: "id"}
  })
  roles: RoleEntity[]


  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "created_by_id"})
  createdBy: UserEntity;


  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn( {name: 'updated_by_id' }) 
  updatedBy: UserEntity
  
}
