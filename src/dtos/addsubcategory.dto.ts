import { IsNotEmpty, IsString } from 'class-validator';

export class AddSubCategory {
  @IsString()
  @IsNotEmpty()
  subCategory: string;
  @IsString()
  @IsNotEmpty()
  parentCategory: string;
}
