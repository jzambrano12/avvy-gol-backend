import { Column, Entity } from 'typeorm';
import BaseEntity from './base.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
  @Column({
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({ default: true })
  status: boolean;

  @Column({ default: 0 })
  points: number;

  @Column({ nullable: true })
  refreshToken: string;
}
