import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsString()
  @IsOptional()
  middleName?: string;
  
  @IsString()
  @IsOptional()
  lastName?: string;

  @IsNumber()
  @IsOptional()
  phone?: number;
}
