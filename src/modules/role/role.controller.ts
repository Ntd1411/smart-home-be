import { Body, Controller, Delete, Get, Param, Patch, Post, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/shared/decorators/public.decorator';
import { CreateRoleDto, GetRolesQueryDto, UpdateRoleDto } from './role.dto';
import { RoleService } from './role.service';

@ApiTags('Vai trò')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // roles list
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Danh sách vai trò',
  })
  async getRoles(
    @Query() queryDto: GetRolesQueryDto,
  ) {
    return await this.roleService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết vai trò',
  })
  async getRole(@Param('id', ParseUUIDPipe) id: string) {
    return await this.roleService.findOne(id);
  }

  // create role
  @Post()
  @ApiOperation({
    summary: 'Tạo vai trò mới',
  })
  async createRole(@Body() role: CreateRoleDto) {
    return await this.roleService.create(role);
  }

  // update role
  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật vai trò',
  })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateRoleDto,
  ) {
    return await this.roleService.update(id, payload);
  }

  // delete role
  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa vai trò',
  })
  async deleteRole(@Param('id', ParseUUIDPipe) id: string) {
    return await this.roleService.remove(id);
  }
}
