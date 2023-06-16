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
  IsUrl,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProductDetails {
  @IsNumber()
  @IsNotEmpty()
  productPrice: number;

  @IsNumber()
  @IsOptional()
  productDiscount?: number;

  @IsOptional()
  @IsString()
  @Length(1, 3)
  productSize?: string;

  @IsOptional()
  @IsString()
  @IsHexColor()
  productColor?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  productQuantity: number;
}

export class ProductImgs {
  @IsString()
  @IsNotEmpty()
  asset_id: string;

  @IsString()
  @IsNotEmpty()
  public_id: string;

  @IsString()
  @IsNotEmpty()
  format: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  secure_url: string;

  @IsString()
  @IsNotEmpty()
  api_key: string;
}

export class Tags {
  @IsString()
  @IsNotEmpty()
  tagName: string;
}

export class UpdateTags {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => Tags)
  tag: Tags;
}

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  productDescription: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => ProductDetails)
  productDetails: ProductDetails[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ProductImgs)
  productImg: ProductImgs;

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

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => Tags)
  tag: Tags;
}
