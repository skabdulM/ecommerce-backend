import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  productDescription: string;

  @IsNumber()
  @IsNotEmpty()
  productPrice: number;

  @IsString()
  @IsNotEmpty()
  productImg: string;

  @IsNumber()
  @IsOptional()
  productDiscount?: number;

  @IsString()
  @IsOptional()
  productSize?: string;

  @IsString()
  @IsOptional()
  productColor?: string;

  @IsNumber()
  @IsNotEmpty()
  productQuantity: number;

  @IsString()
  @IsNotEmpty()
  subcategoryId: string;

  @IsString()
  @IsOptional()
  brandId?: string;
}
