import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPassword {
  @IsString()
  @IsNotEmpty()
  newPassword: string;
  @IsString()
  @IsNotEmpty()
  code: string;
}
