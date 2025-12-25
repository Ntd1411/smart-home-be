import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MqttService } from '../mqtt/mqtt.service';
import { DeviceService } from '../device/device.service';
import { RoomSensorSnapshotEntity } from 'src/database/entities/sensor-data.entity';
import { getDeviceStatistics } from 'src/shared/utils/getDeviceStatistics';
import { DeviceType } from 'src/shared/enums/device.enum';

@Injectable()
export class KitchenService {
  constructor(
    private readonly mqttService: MqttService,
    private readonly deviceService: DeviceService,
    @InjectRepository(RoomSensorSnapshotEntity)
    private readonly sensorSnapshot: Repository<RoomSensorSnapshotEntity>,
  ) {}

  async getSensorData() {
    await this.mqttService.getSensorData('kitchen');
  }

  async controlLight(state: boolean) {
    const isLightOnline = await this.deviceService.isDeviceTypeOnline('kitchen', DeviceType.LIGHT);
    if (!isLightOnline) {
      throw new BadRequestException('Không thể điều khiển đèn: Tất cả đèn nhà bếp đang offline');
    }
    await this.mqttService.controlLight('kitchen', state);
  }

  async controlDoor(state: boolean) {
    const isDoorOnline = await this.deviceService.isDeviceTypeOnline('kitchen', DeviceType.DOOR);
    if (!isDoorOnline) {
      throw new BadRequestException('Không thể điều khiển cửa: Tất cả cửa nhà bếp đang offline');
    }
    await this.mqttService.controlDoor('kitchen', state);
  }

  async getDetails() {
    const devices = await this.deviceService.findAll('kitchen');

    const deviceStatistics = getDeviceStatistics(devices);

    const sensorSnapshot = await this.sensorSnapshot.findOne({
      where: {
        location: 'kitchen',
      },
    });

    return {
      location: 'kitchen',
      devices: devices.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        lastState: d.lastState,
        status: d.status,
      })),
      ...sensorSnapshot,
      ...deviceStatistics,
    };
  }
}
