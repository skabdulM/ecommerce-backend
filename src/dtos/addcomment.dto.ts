import {  IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddCommentDto {
  @IsString()
  @IsNotEmpty()
  feedback: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  // @IsString()
  // @IsOptional()
  // user?: string;
}
