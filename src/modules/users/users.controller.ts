import { Body, Controller, Post } from '@nestjs/common';
import { UserEntity } from 'src/entities/user.entity';

// Entities

// Dtos
import { CreateUserDto } from './dtos/create-user.dto';

// Services
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.userService.createUser(createUserDto);
  }
}
