import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
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
  // @IsEmail()
  // @IsOptional()
  // email?: string;

  @IsOptional()
  @ValidateNested()
  @IsObject()
  @Type(() => EditUserName)
  name?: EditUserName;

  @IsString()
  @IsOptional()
  phone?: string;
}
