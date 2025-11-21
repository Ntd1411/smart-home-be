import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

export abstract class BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @VersionColumn()
  version: number;


  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;


  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt: Date;

  @Exclude()
  @Column({ type: 'uuid', name: 'created_by_id', nullable: true })
  createdById: string;

  @Exclude()
  @Column({ type: 'uuid', name: 'updated_by_id', nullable: true })
  updatedById: string;
}
