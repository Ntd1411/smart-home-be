import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MqttService } from '../mqtt/mqtt.service';
import { DeviceType } from 'src/shared/enums/device.enum';
import { DeviceService } from '../device/device.service';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomSensorSnapshotEntity } from 'src/database/entities/sensor-data.entity';
import { Repository } from 'typeorm';
import { getDeviceStatistics } from 'src/shared/utils/getDeviceStatistics';
import { Device } from 'src/database/entities/device.entity';
import { ChangeDoorPasswordDto } from './bedroom.dto';

@Injectable()
export class BedroomService {
  constructor(
    private readonly mqttService: MqttService,
    private readonly deviceService: DeviceService,
    @InjectRepository(RoomSensorSnapshotEntity)
    private readonly sensorSnapshot: Repository<RoomSensorSnapshotEntity>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}


  async controlLight(state: boolean) {
    await this.mqttService.controlLight('bedroom', state);
  }

  async controlDoor(state: boolean) {
    await this.mqttService.controlDoor('bedroom', state);
  }

  async changeDoorPassword(changePasswordDto: ChangeDoorPasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    // Tìm door device trong bedroom
    const doorDevice = await this.deviceRepository.findOne({
      where: {
        location: 'bedroom',
        type: DeviceType.DOOR,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!doorDevice) {
      throw new NotFoundException('Không tìm thấy cửa trong phòng ngủ');
    }

    // Nếu chưa có password (lần đầu set password)
    if (!doorDevice.password) {
      // Lưu password plain text vào DB
      await this.deviceRepository.update(
        { id: doorDevice.id },
        { password: newPassword },
      );
      // Gửi password mới đến wokwi qua MQTT
      await this.mqttService.publishPassword('bedroom', newPassword);
      return { success: true, message: 'Đã đặt mật khẩu mới cho cửa' };
    }

    // Kiểm tra mật khẩu cũ (plain text comparison)
    if (oldPassword !== doorDevice.password) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    // Lưu password plain text vào DB
    await this.deviceRepository.update(
      { id: doorDevice.id },
      { password: newPassword },
    );

    // Gửi password mới đến wokwi qua MQTT
    await this.mqttService.publishPassword('bedroom', newPassword);

    return { success: true, message: 'Đã đổi mật khẩu cửa thành công' };
  }

  async getDetails() {
    const devices = await this.deviceService.findAll('bedroom');

    const deviceStatistics = getDeviceStatistics(devices);


    // temperature
    const sensorSnapshot = await this.sensorSnapshot.findOne({
      where: {
        location: 'bedroom',
      },
    });

    return {
      location: 'bedroom',
      devices: devices.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        lastState: d.lastState,
        status: d.status,
      })),
      ...sensorSnapshot,
      ...deviceStatistics
    };
  }
}
