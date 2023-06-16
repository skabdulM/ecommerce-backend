import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsHexColor,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

export class Id {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}

export class UpdateProductDetails {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id: string;

  @IsNumber()
  @IsOptional()
  productPrice?: number;

  @IsNumber()
  @IsOptional()
  productDiscount?: number;

  @IsString()
  @IsOptional()
  @Length(1, 3)
  productSize?: string;

  @IsString()
  @IsOptional()
  @IsHexColor()
  productColor?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  productQuantity: number;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  productName?: string;

  @IsString()
  @IsOptional()
  productDescription?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => UpdateProductDetails)
  productDetails?: UpdateProductDetails[];

  @IsString()
  @IsOptional()
  @IsMongoId()
  parentCategoryId?: string;

  @IsString()
  @IsOptional()
  @IsMongoId()
  subcategoryId?: string;

  @IsString()
  @IsOptional()
  @IsMongoId()
  brandId?: string;
}
