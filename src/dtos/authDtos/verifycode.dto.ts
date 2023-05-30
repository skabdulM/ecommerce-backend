import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyCode {
  @IsString()
  @IsNotEmpty()
  code: string;
}
