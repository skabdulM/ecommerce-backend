import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorator';
import { JwtGuard, RolesGuard } from '../auth/guard';
import {
  ProductDetails,
  ProductDto,
  Id,
  UpdateProductDto,
  UpdateTags,
} from '../dtos';
import { ProductService } from './product.service';
import { Products } from '@prisma/client';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Roles('MANAGER', 'ADMIN')
  @UseGuards(JwtGuard, RolesGuard)
  @Post('addProduct')
  async addProduct(@Body() dto: ProductDto) {
    return this.productService.addProduct(dto);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Roles('MANAGER', 'ADMIN')
  @UseGuards(JwtGuard, RolesGuard)
  @Patch('updateProduct/:id')
  async updateProduct(@Param() productId: Id, @Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(productId, dto);
  }

  @Roles('MANAGER', 'ADMIN')
  @UseGuards(JwtGuard, RolesGuard)
  @Patch('updateProduct/addVariation/:id')
  async addProductVariation(
    @Param() productId: Id,
    @Body() dto: ProductDetails,
  ) {
    return this.productService.addProductVariation(productId, dto);
  }

  @Get('getproduct/:id')
  async getProduct(@Param() productId: Id) {
    return this.productService.getProduct(productId);
  }

  // @HttpCode(HttpStatus.NO_CONTENT)
  // @Delete('remove/tag/:id')
  // async removeTag(@Param() tagId: Id) {
  //   return this.productService.removeTag(tagId);
  // }

  @Roles('MANAGER', 'ADMIN')
  @UseGuards(JwtGuard, RolesGuard)
  @Patch('updatetag/:id')
  async updateTag(@Param() product: Id, @Body() tags: UpdateTags) {
    return this.productService.updateTag(product, tags);
  }

  @Get('search')
  searchProduct(
    @Query('greaterthan', ParseIntPipe) greaterthan: number,
    @Query('lessthan', ParseIntPipe) lessthan: number,
    @Query('take', ParseIntPipe) take: number,
    @Query('searchQuery') searchQuery?: string,
    @Query('sortbyViews') sortbyViews?: string,
    @Query('sortbyPrice') sortbyPrice?: string,
    @Query('cursor') cursor?: string,
  ): Promise<Products[]> {
    return this.productService.searchProduct({
      greaterthan,
      lessthan,
      take: Number(take),
      searchQuery,
      sortbyViews,
      sortbyPrice,
      cursor: { id: cursor },
    });
  }
  @Get('searchcount')
  searchProductcount(
    @Query('searchQuery') searchQuery?: string,
    @Query('greaterthan', ParseIntPipe) greaterthan?: number,
    @Query('lessthan', ParseIntPipe) lessthan?: number,
  ) {
    return this.productService.searchProductcount({
      searchQuery,
      greaterthan,
      lessthan,
    });
  }
}
