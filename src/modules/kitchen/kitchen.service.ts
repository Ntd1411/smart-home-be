import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MqttService } from '../mqtt/mqtt.service';
import { DeviceService } from '../device/device.service';
import { RoomSensorSnapshotEntity } from 'src/database/entities/sensor-data.entity';
import { getDeviceStatistics } from 'src/shared/utils/getDeviceStatistics';

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
    await this.mqttService.controlLight('kitchen', state);
  }

  async controlDoor(state: boolean) {
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
