import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EditUserName {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}

export class EditUserDto {
  @IsOptional()
  @ValidateNested()
  @IsObject()
  @Type(() => EditUserName)
  name?: EditUserName;

  @IsString()
  @IsOptional()
  @IsPhoneNumber('IN')
  @IsMobilePhone('en-IN')
  phone?: string;
}
