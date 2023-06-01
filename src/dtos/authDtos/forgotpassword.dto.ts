import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class ForgotPassword {
  @IsString()
  @IsNotEmpty()
  @Length(4, 15)
  @Matches(
    '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$',
    'password too weak',
  )
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
