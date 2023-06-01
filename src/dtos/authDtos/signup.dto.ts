import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
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
  password: string;

  @ValidateNested()
  @IsObject()
  @Type(() => SignUpname)
  name: SignUpname;

  @IsString()
  @IsOptional()
  @IsPhoneNumber('IN')
  phone?: string;
}
