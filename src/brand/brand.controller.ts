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
import { BrandService } from './brand.service';
import { Roles } from '../auth/decorator';
import { JwtGuard, RolesGuard } from '../auth/guard';
import { AddBrandDto } from '../dtos';

@Controller('brand')
export class BrandController {
  constructor(private brandService: BrandService) {}

  @Roles('MANAGER', 'ADMIN')
  @UseGuards(JwtGuard, RolesGuard)
  @Post('addbrand')
  async addBrand(@Body() dto: AddBrandDto) {
    return this.brandService.addBrand(dto);
  }

  @Roles('MANAGER', 'ADMIN')
  @UseGuards(JwtGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('removebrand/:id')
  async removeBrand(@Param('id') id: string) {
    return this.brandService.removeBrand(id);
  }

  @Get('brandnames')
  async getBrandnames() {
    return this.brandService.getBrandnames();
  }
}
