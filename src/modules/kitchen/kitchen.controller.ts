import { Body, Controller, Get, Patch } from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { KitchenStateDto } from './kitchen.dto';

@Controller('kitchen')
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Get('details')
  async getDetails() {
    return await this.kitchenService.getDetails();
  }

  @Patch('light')
  async controlLight(@Body() body: KitchenStateDto) {
    await this.kitchenService.controlLight(body.state);
    return { success: true, message: `Light turned ${body.state ? 'ON' : 'OFF'}` };
  }

  @Patch('door')
  async controlDoor(@Body() body: KitchenStateDto) {
    await this.kitchenService.controlDoor(body.state);
    return { success: true, message: `Door ${body.state ? 'UNLOCK' : 'LOCK'}` };
  }
}
