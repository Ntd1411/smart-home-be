import { HashingService } from 'src/shared/services/hashing.service';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,

    private readonly hashingService: HashingService
  ) {}

  // create user
  async create(user: CreateUserDto) {
    try {
      // 1. Check tồn tại
    const existingUser = await this.usersRepository.findOne({
      where: [{ username: user.username }, { email: user.email }],
    });
    if (existingUser) {
      throw new ConflictException('Username hoặc email đã tồn tại');
    }

    // 2. Hash password
    const hashedPassword =  this.hashingService.hash(user.password);

    // 3. Tạo entity mới
    const newUser = this.usersRepository.create({
      ...user,
      password: hashedPassword,
    });

    // 4. Lưu DB
    await this.usersRepository.save(newUser);

    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException(
          'Username hoặc email đã tồn tại',
        );
      }
      throw error;
    }
  }
}
