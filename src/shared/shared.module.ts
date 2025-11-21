import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import envConfig from "src/configs/env.config";
import { ConfigService } from "./services/config.service";
import { ApiExceptionFilter } from "./filters/api-exception.filter";
import  { APP_FILTER } from '@nestjs/core';

// global module 
// every module can use its services without importing
@Global() // có/không có cũng được đối với APP_FILTER
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // load used to get information (EX in the ConfigService: this.configService.get('port'); )
      load: [envConfig],
    })
  ],
  providers: [
    // phải export thì mới inject nơi khác
    ConfigService, // use the load above to get information
    // không cần export vẫn hoạt động toàn cục
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter
    }
  ],
  exports: [
    ConfigService
  ]
})

export class SharedModule {}