import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './user.dto';

@Controller('debug')
export class UserController {
  @Post("validate")
  testValidation(@Body() body: CreateUserDto) {
    return { received: body }
  }

}
