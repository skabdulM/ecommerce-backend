import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AddBrandDto } from '../dtos';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  async addBrand(dto: AddBrandDto) {
    return await this.prisma.brands
      .create({
        data: {
          name: dto.name.toLowerCase(),
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException('Brand alredy exists');
          }
        }
        throw error;
      });
  }

  async removeBrand(id: string) {
    await this.prisma.brands
      .delete({
        where: {
          id,
        },
      })
      .catch((error) => {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      });
  }

  async getBrandnames() {
    return await this.prisma.brands.findMany({
      // where: {
      //   NOT: [
      //     {
      //       products: {
      //         none: {},
      //       },
      //     },
      //   ],
      // },
    });
  }
}
