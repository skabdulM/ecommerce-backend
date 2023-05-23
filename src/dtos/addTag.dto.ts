import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class addProductTag {
  @IsString()
  @IsNotEmpty()
  tagName: string;
  @IsString()
  @IsNotEmpty()
  productId: string;
}
