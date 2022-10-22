import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhitelistEntity } from 'src/entities';
import { WhitelistController } from './whitelist.controller';
import { WhitelistService } from './whitelist.service';

@Module({
  imports: [TypeOrmModule.forFeature([WhitelistEntity])],
  controllers: [WhitelistController],
  providers: [WhitelistService],
})
export class WhitelistModule {}
