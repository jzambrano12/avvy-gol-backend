import { Body, Controller, Post, Put, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { SendgridService } from './sendgrid.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sendgridService: SendgridService,
  ) {}

  @Post('send')
  async sendEmail(@Query('email') email) {
    const mail = {
      to: email,
      subject: 'Greeting Message from NestJS Sendgrid',
      from: 'jorge.zambrano+support@avvy.co',
      text: 'Hello World from NestJS Sendgrid',
      html: '<h1>Hello World from NestJS Sendgrid</h1>',
    };

    return await this.sendgridService.send(mail);
  }

  @Post('signin')
  signIn(@Body() body) {
    const { email } = body;
    return this.authService.signIn(email);
  }

  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Put('logout/:user_id')
  logout(@Body() { email }: { email: string }) {
    return this.authService.logout(email);
  }
}
