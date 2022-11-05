import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhitelistEntity } from '../../entities';
import { AddUserToWhitelistDto } from './dtos/whitelist.dto';

@Injectable()
export class WhitelistService {
  constructor(
    @InjectRepository(WhitelistEntity)
    private readonly whiteListRepository: Repository<WhitelistEntity>,
  ) {}

  async addUserToWhitelist(
    addUserToWhitelistDto: AddUserToWhitelistDto,
  ): Promise<WhitelistEntity> {
    const data = this.whiteListRepository.create(addUserToWhitelistDto);

    try {
      return await this.whiteListRepository.save(data);
    } catch (error) {
      throw new NotFoundException(error.detail);
    }
  }

  async verifyUser({
    user_id,
  }: AddUserToWhitelistDto): Promise<WhitelistEntity> {
    const user = await this.whiteListRepository.findOne({ where: { user_id } });
    console.log({ user_id });
    if (!user) {
      throw new NotFoundException('User does not exist in the Whitelist');
    }

    return user;
  }
}
