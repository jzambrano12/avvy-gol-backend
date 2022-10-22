import { Body, Controller, Post } from '@nestjs/common';
import { WhitelistEntity } from 'src/entities';
import { AddUserToWhitelistDto } from './dtos/whitelist.dto';
import { WhitelistService } from './whitelist.service';

@Controller('whitelist')
export class WhitelistController {
  constructor(private readonly whitelistService: WhitelistService) {}

  @Post('/add')
  addUserToWhitelist(
    @Body() addUserToWhitelistDto: AddUserToWhitelistDto,
  ): Promise<WhitelistEntity> {
    return this.whitelistService.addUserToWhitelist(addUserToWhitelistDto);
  }
}
