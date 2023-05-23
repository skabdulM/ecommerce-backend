import { IsNotEmpty, IsString } from 'class-validator';

export class AddParentCategory {
  @IsString()
  @IsNotEmpty()
  parentCategory: string;
}
