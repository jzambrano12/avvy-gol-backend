import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddUserToWhitelistDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
