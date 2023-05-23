import {
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class OrderStatusDto {
  ///status default in db
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
