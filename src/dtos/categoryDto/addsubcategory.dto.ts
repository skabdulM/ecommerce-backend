import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class AddSubCategory {
  @IsString()
  @IsNotEmpty()
  subcategoryName: string;

  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  parentCategoryId: string;
}
