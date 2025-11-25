import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/entities/user.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { RefreshTokenEntity } from 'src/database/entities/refresh-token.entity';
import { AuthCleanupService } from './auth-cleanup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity]),
    // cung cấp @Cron(); @Interval(); @Timeout()
    ScheduleModule.forRoot(), 
  ],
  providers: [AuthService, AuthCleanupService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {

}
