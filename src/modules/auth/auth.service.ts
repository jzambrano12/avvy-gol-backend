import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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

    try {
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
        from: 'jorge.zambrano+support@avvy.co',
        templateId: 'd-4915327d2c3b4e8198196d38bece37fd',
        dynamic_template_data: {
          url: `http://localhost:3001/?userId=${user.id}&accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
        },
      };

      // Send email
      await this.sendgridService.send(mail);
    } catch (error) {
      console.error({ error });
      throw new InternalServerErrorException();
    }
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
