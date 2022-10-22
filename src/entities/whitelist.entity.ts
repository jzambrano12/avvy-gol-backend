import { Column, Entity } from 'typeorm';
import BaseEntity from './base.entity';

@Entity('whitelist')
export class WhitelistEntity extends BaseEntity {
  @Column({
    nullable: false,
    unique: true,
  })
  user_id: string;
}
