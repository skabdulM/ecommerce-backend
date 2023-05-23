import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateProductVariation {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  productColor?: string;

  @IsNumber()
  @IsOptional()
  productQuantity?: number;
}
