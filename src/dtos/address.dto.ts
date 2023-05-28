import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  streetName: string;

  @IsString()
  @IsNotEmpty()
  landmark: string;

  @IsString()
  @IsOptional()
  locality: string;

  @IsNumber()
  @IsNotEmpty()
  pincode: number;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsBoolean()
  @IsNotEmpty()
  addresstype: boolean;
}
