import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

//Jwt
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserEntity, WhitelistEntity } from 'src/entities';
import { WhitelistService } from '../whitelist/whitelist.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './jwt/accessToken.strategy';
import { RefreshTokenStrategy } from './jwt/refreshToken.strategy';

// Services
import { SendgridService } from './sendgrid.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, WhitelistEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    WhitelistService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    ConfigService,
    SendgridService,
  ],
})
export class AuthModule {}
