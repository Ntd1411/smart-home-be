import { UserService } from './user.service';
import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './user.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/shared/decorators/public.decorator';

@ApiTags("Người dùng")
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService){}

  // create user
  @Post()
  @ApiOperation({
    summary: "Tạo người dùng mới"
  })
  async createUser(
    @Body() user: CreateUserDto 
  ) {
    return await this.userService.create(user)
  }
  

}
