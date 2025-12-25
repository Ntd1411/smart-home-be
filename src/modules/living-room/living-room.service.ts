import { getDeviceStatistics } from './../../shared/utils/getDeviceStatistics';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MqttService } from '../mqtt/mqtt.service';
import { DeviceService } from '../device/device.service';
import { DeviceStatus, DeviceType } from 'src/shared/enums/device.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomSensorSnapshotEntity } from 'src/database/entities/sensor-data.entity';
import { Repository } from 'typeorm';
import { Device } from 'src/database/entities/device.entity';
import { ChangeDoorPasswordDto } from './living-room.dto';

@Injectable()
export class LivingRoomService {
  constructor(
    private readonly mqttService: MqttService,
    private readonly deviceService: DeviceService,
    @InjectRepository(RoomSensorSnapshotEntity)
    private readonly sensorSnapshot: Repository<RoomSensorSnapshotEntity>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  async getSensorData() {
    await this.mqttService.getSensorData('living-room');
  }

  async controlLight(state: boolean) {
    const isLightOnline = await this.deviceService.isDeviceTypeOnline('living-room', DeviceType.LIGHT);
    if (!isLightOnline) {
      throw new BadRequestException('Không thể điều khiển đèn: Tất cả đèn phòng khách đang offline');
    }
    await this.mqttService.controlLight('living-room', state);
  }

  async controlDoor(state: boolean) {
    const isDoorOnline = await this.deviceService.isDeviceTypeOnline('living-room', DeviceType.DOOR);
    if (!isDoorOnline) {
      throw new BadRequestException('Không thể điều khiển cửa: Tất cả cửa phòng khách đang offline');
    }
    await this.mqttService.controlDoor('living-room', state);
  }

  async changeDoorPassword(changePasswordDto: ChangeDoorPasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    // Tìm door device trong living-room
    const doorDevice = await this.deviceRepository.findOne({
      where: {
        location: 'living-room',
        type: DeviceType.DOOR,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!doorDevice) {
      throw new NotFoundException('Không tìm thấy cửa trong phòng khách');
    }

    // Nếu chưa có password (lần đầu set password)
    if (!doorDevice.password) {
      // Lưu password plain text vào DB
      await this.deviceRepository.update(
        { id: doorDevice.id },
        { password: newPassword },
      );
      // Gửi password mới đến wokwi qua MQTT
      await this.mqttService.publishPassword('living-room', newPassword);
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
    await this.mqttService.publishPassword('living-room', newPassword);

    return { success: true, message: 'Đã đổi mật khẩu cửa thành công' };
  }

  async getDetails() {
    const devices = await this.deviceService.findAll("living-room");

    const deviceStatistics = getDeviceStatistics(devices);

    // temperature
    const sensorSnapshot = await this.sensorSnapshot.findOne({where: {
      location: "living-room"
    }})


    return {
      location: 'living-room',
      devices: devices.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        lastState: d.lastState,
        status: d.status,
      })),
      ...sensorSnapshot,
      ...deviceStatistics
    }
  }
}
