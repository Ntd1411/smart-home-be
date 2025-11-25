import { MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';
import helmet from 'helmet';
import compression from "compression";
import { LoggerMiddleware } from './shared/middlewares/logger.middleware';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
   SharedModule,
   DatabaseModule,
   UserModule,
   AuthModule
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        helmet(),
        compression(),
        LoggerMiddleware

      )
      .forRoutes('*');
  }

}
