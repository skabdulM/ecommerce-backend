import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class AddBrandDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
