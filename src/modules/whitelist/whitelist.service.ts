import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.detail,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async verifyUser(
    addUserToWhitelistDto: AddUserToWhitelistDto,
  ): Promise<WhitelistEntity> {
    const { user_id } = addUserToWhitelistDto;
    const user = await this.whiteListRepository.findOne({ where: { user_id } });
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'User does not exist in the Whitelist',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return user;
  }
}
