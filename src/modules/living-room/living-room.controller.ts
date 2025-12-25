import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { LivingRoomService } from './living-room.service';
import { LivingRoomStateDto, ChangeDoorPasswordDto } from './living-room.dto';

@Controller('living-room')
export class LivingRoomController {
  constructor(private readonly livingRoomService: LivingRoomService) {}


  @Get("details")
  async getDetails() {
    return await this.livingRoomService.getDetails();
  }

  @Patch('light')
  async controlLight(@Body() body: LivingRoomStateDto) {
    await this.livingRoomService.controlLight(body.state);
    return { success: true, message: `Light turned ${body.state ? 'ON' : 'OFF'}` };
  }

  @Patch('door')
  async controlDoor(@Body() body: LivingRoomStateDto) {
    await this.livingRoomService.controlDoor(body.state);
    return { success: true, message: `Door ${body.state ? 'UNLOCK' : 'LOCK'}` };
  }

  @Patch('door/change-password')
  async changeDoorPassword(@Body() body: ChangeDoorPasswordDto) {
    return await this.livingRoomService.changeDoorPassword(body);
  }
}
