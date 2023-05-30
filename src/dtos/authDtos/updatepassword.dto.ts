import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePassword {
  @IsString()
  @IsNotEmpty()
  password: string;
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
