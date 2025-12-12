import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RoleEntity } from 'src/database/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity]),

  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],

})

export class UserModule{}

