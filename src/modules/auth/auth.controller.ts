import { Body, Controller, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  signIn(@Body() body): Promise<{ accessToken: string; refreshToken: string }> {
    const { email } = body;
    return this.authService.signIn(email);
  }

  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Put('/logout/:user_id')
  logout(@Body() { email }: { email: string }) {
    return this.authService.logout(email);
  }
}
