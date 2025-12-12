import { UserService } from './user.service';
import { Controller, Post, Body, Get, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/shared/decorators/public.decorator';

@ApiTags('Người dùng')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // users list
  @Get()
  @ApiOperation({
    summary: 'Danh sách người dùng',
  })
  async getUsers() {
    return await this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết người dùng',
  })
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    return await this.userService.findOne(id);
  }

  // create user
  @Post()
  @ApiOperation({
    summary: 'Tạo người dùng mới',
  })
  async createUser(@Body() user: CreateUserDto) {
    return await this.userService.create(user);
  }

  // update user
  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật người dùng',
  })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateUserDto,
  ) {
    return await this.userService.update(id, payload);
  }

  // delete user
  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa người dùng',
  })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return await this.userService.remove(id);
  }
}
