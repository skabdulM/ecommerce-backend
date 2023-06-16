import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Roles } from '../auth/decorator';
import { JwtGuard, RolesGuard } from '../auth/guard';
import { AddParentCategory, AddSubCategory } from '../dtos';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Roles('MANAGER', 'ADMIN')
  @UseGuards(JwtGuard, RolesGuard)
  @Post('addparentcategory')
  async createParentCategory(@Body() dto: AddParentCategory) {
    return this.categoryService.createCategory(dto);
  }

  @Roles('MANAGER', 'ADMIN')
  @UseGuards(JwtGuard, RolesGuard)
  @Post('addsubcategory')
  async addsubCategory(@Body() dto: AddSubCategory) {
    return this.categoryService.addSubCategory(dto);
  }

  @Get('categorynames')
  async getallcatergory() {
    return this.categoryService.getcategorynames();
  }
}
