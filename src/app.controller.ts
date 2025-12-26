import { Controller, Get } from '@nestjs/common';
import { App } from 'supertest/types';


@Controller('/')
export class AppController {
  @Get()
  getStatus(): string {
    return 'Smart Home System is running';
  }
}
