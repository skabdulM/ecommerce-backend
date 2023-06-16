import { IsString, IsNotEmpty } from 'class-validator';

export class AddBrandDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
