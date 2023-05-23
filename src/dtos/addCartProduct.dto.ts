import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class AddCartProductDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  productQuantity: number;
}
