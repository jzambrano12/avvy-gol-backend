import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities';
import { hashData } from 'src/misc/hashData';
import { Repository } from 'typeorm';
import { WhitelistService } from '../whitelist/whitelist.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { JwtPayload } from './jwt/payload';
import { SendgridService } from './sendgrid.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly whitelistService: WhitelistService,
    private readonly configService: ConfigService,
    private readonly sendgridService: SendgridService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException("Email doesn't exist");
    }

    // Verify if user exist in the whitelist
    await this.whitelistService.verifyUser({
      user_id: user.id.toString(),
    });

    // Refreshing tokens
    const payload: JwtPayload = { email };
    const tokens = await this.getTokens(payload);
    await this.updateRefreshToken(email, tokens.refreshToken);

    const mail = {
      to: email,
      subject: 'Greeting Message from NestJS Sendgrid',
      from: 'jorge.zambrano+support@avvy.co',
      text: 'Hello World from NestJS Sendgrid',
      html: `<h1>Here is the link to Log in into Avvygol <a href="https://localhost:3001/signin?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}" target="_blank">Link here</a></h1>`,
    };

    await this.sendgridService.send(mail);
  }

  async signUp(createUserDto: CreateUserDto) {
    const payload: JwtPayload = { email: createUserDto.email };
    const tokens = await this.getTokens(payload);
    await this.updateRefreshToken(createUserDto.email, tokens.refreshToken);
    const refreshToken = await hashData(tokens.refreshToken);

    const user = this.userRepository.create({
      ...createUserDto,
      refreshToken,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      throw new NotFoundException(error.detail);
    }
  }

  async logout(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    const userUpdate = await this.userRepository.preload({
      ...user,
      refreshToken: null,
    });

    if (userUpdate) {
      return await this.userRepository.save(userUpdate);
    }

    throw new NotFoundException('User is not exist');
  }

  // Tokens functions
  async getTokens(payload: { email: string }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(email: string, refreshToken: string) {
    const hashedRefreshToken = await hashData(refreshToken);
    const user = await this.userRepository.findOne({ where: { email } });

    if (user && hashedRefreshToken) {
      await this.userRepository.update(user.id, {
        refreshToken: hashedRefreshToken,
      });
    }
  }
}
