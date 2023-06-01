import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class UpdatePassword {
  @IsString()
  @IsNotEmpty()
  @Length(4, 15)
  @Matches(
    '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$',
    'password too weak',
  )
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 15)
  @Matches(
    '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$',
    'password too weak',
  )
  newPassword: string;
}
