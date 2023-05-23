import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class EditCartProductDto {
  @IsNumber()
  @IsNotEmpty()
  productQuantity: number;
}
