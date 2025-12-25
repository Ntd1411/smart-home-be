import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { BedroomService } from './bedroom.service';
import { BedRoomStateDto, ChangeDoorPasswordDto } from './bedroom.dto';

@Controller('bedroom')
export class BedroomController {
  constructor(private readonly bedroomService: BedroomService) {}

  @Get("details")
  async getDetails() {
    return await this.bedroomService.getDetails();
  }


  @Patch('light')
  async controlLight(@Body() body: BedRoomStateDto) {
    await this.bedroomService.controlLight(body.state);
    return { success: true, message: `Light turned ${body.state ? 'ON' : 'OFF'}` };
  }

  @Patch('door')
  async controlDoor(@Body() body: BedRoomStateDto) {
    await this.bedroomService.controlDoor(body.state);
    return { success: true, message: `Door ${body.state ? 'UNLOCK' : 'LOCK'}` };
  }

  @Patch('door/change-password')
  async changeDoorPassword(@Body() body: ChangeDoorPasswordDto) {
    return await this.bedroomService.changeDoorPassword(body);
  }
}
