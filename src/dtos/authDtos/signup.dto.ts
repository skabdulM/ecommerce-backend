import { Type } from 'class-transformer';
import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';

export class SignUpname {
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  firstName: string;

  @IsString()
  @IsOptional()
  @Length(2, 10)
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  lastName: string;
}

export class SignUp {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 15)
  @Matches('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')
  password: string;

  @ValidateNested()
  @IsObject()
  @Type(() => SignUpname)
  name: SignUpname;

  @IsString()
  @IsOptional()
  @IsPhoneNumber('IN')
  @IsMobilePhone('en-IN')
  phone?: string;

  @IsString()
  @IsOptional()
  adminHash?: string;
}
