import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
   SharedModule,
   DatabaseModule,
   UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
