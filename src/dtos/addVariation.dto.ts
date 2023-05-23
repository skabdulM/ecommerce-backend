import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddProductVariation {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsOptional()
  productSize?: string;

  @IsString()
  @IsOptional()
  productColor?: string;

  @IsNumber()
  @IsNotEmpty()
  productQuantity: number;
}
