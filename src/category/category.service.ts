import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddParentCategory, AddSubCategory } from '../dtos';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(dto: AddParentCategory) {
    return await this.prisma.parentCategory
      .create({
        data: {
          parentcategoryName: dto.parentcategoryName.toLowerCase(),
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException('Category alredy exists');
          }
        }
        throw error;
      });
  }

  async addSubCategory(dto: AddSubCategory) {
    return await this.prisma.subCategory
      .create({
        data: {
          parentCategoryId: dto.parentCategoryId,
          subcategoryName: dto.subcategoryName.toLowerCase(),
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException('Category alredy exists');
          }
        }
        throw error;
      });
  }

  async getcategorynames() {
    return await this.prisma.parentCategory.findMany({
      // where: {
      //   NOT: [
      //     {
      //       product: {
      //         none: {},
      //       },
      //     },
      //   ],
      // },
      include: {
        subcategories: {
          select: {
            id: true,
            subcategoryName: true,
            parentCategoryId: true,
          },
        },
      },
    });
  }
}
