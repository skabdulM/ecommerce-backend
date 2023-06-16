import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ProductDetails,
  ProductDto,
  Id,
  UpdateProductDto,
  UpdateTags,
} from '../dtos';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async addProduct(dto: ProductDto) {
    if (dto.subcategoryId) {
      const category = await this.prisma.subCategory
        .findUnique({
          where: { id: dto.subcategoryId },
          select: { parentCategoryId: true },
        })
        .catch((error) => {
          throw new BadRequestException(error);
        });
      dto.parentCategoryId = category ? category.parentCategoryId : undefined;
    }
    const product = await this.prisma.products
      .create({
        data: {
          productName: dto.productName,
          productDescription: dto.productDescription,
          productDetails: {
            createMany: {
              data: dto.productDetails,
            },
          },
          brand: dto.brandId
            ? {
                connect: {
                  id: dto.brandId,
                },
              }
            : undefined,
          productImgs: {
            createMany: { data: dto.productImg },
          },
          ParentCategory: dto.parentCategoryId
            ? {
                connect: {
                  id: dto.parentCategoryId,
                },
              }
            : undefined,
          SubCategory: dto.subcategoryId
            ? {
                connect: {
                  id: dto.subcategoryId,
                },
              }
            : undefined,
          tag: {
            createMany: {
              data: dto.tag,
            },
          },
        },
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });
    return product;
  }

  async updateProduct(productId: Id, dto: UpdateProductDto) {
    const transaction = await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < dto.productDetails.length; i++) {
        const element = dto.productDetails[i];
        await tx.productDetails
          .update({
            where: { id: element.id },
            data: {
              productPrice: element.productPrice
                ? element.productPrice
                : undefined,
              productDiscount: element.productDiscount
                ? element.productDiscount
                : undefined,
              productSize: element.productSize
                ? element.productSize.toUpperCase()
                : undefined,
              productColor: element.productColor
                ? element.productColor.toLowerCase()
                : undefined,
              productQuantity: element.productQuantity
                ? element.productQuantity
                : undefined,
            },
          })
          .catch((error) => {
            throw new BadRequestException(error);
          });
      }
      const product = await tx.products
        .update({
          where: {
            id: productId.id,
          },
          data: {
            productName: dto.productName ? dto.productName : undefined,
            productDescription: dto.productDescription
              ? dto.productDescription
              : undefined,

            ParentCategory: dto.parentCategoryId
              ? {
                  connect: {
                    id: dto.parentCategoryId,
                  },
                }
              : undefined,
            SubCategory: dto.subcategoryId
              ? {
                  connect: {
                    id: dto.subcategoryId,
                  },
                }
              : undefined,
            brand: dto.brandId
              ? {
                  connect: {
                    id: dto.brandId,
                  },
                }
              : undefined,
          },
          include: { productDetails: true },
        })
        .catch((error) => {
          throw new BadRequestException(error);
        });
      return product;
    });
    return transaction;
  }

  async addProductVariation(productId: Id, dto: ProductDetails) {
    const variation = await this.prisma.products
      .update({
        where: { id: productId.id },
        data: {
          productDetails: {
            create: {
              productPrice: dto.productPrice,
              productDiscount: dto.productDiscount
                ? dto.productDiscount
                : undefined,
              productSize: dto.productSize
                ? dto.productSize.toUpperCase()
                : undefined,
              productColor: dto.productColor ? dto.productColor : undefined,
              productQuantity: dto.productQuantity,
            },
          },
        },
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });
    return variation;
  }

  async getProduct(productId: Id) {
    return await this.prisma.products
      .findUnique({
        where: { id: productId.id },
        include: {
          brand: true,
          comments: true,
          ParentCategory: true,
          SubCategory: {
            select: {
              id: true,
              subcategoryName: true,
            },
          },
          productImgs: true,
          productDetails: {
            select: {
              id: true,
              productPrice: true,
              productDiscount: true,
              productQuantity: true,
              productColor: true,
              productSize: true,
            },
          },
          tag: {
            select: {
              tagName: true,
            },
          },
        },
      })
      .then(async (data) => {
        await this.prisma.products.update({
          where: { id: productId.id },
          data: {
            views: { increment: 1 },
          },
        });
        return data;
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });
  }

  // async removeTag(tagId: Id) {
  //   await this.prisma.tags
  //     .delete({ where: { id: tagId.id } })
  //     .catch((error) => {
  //       throw new BadRequestException(error);
  //     });
  // }

  async updateTag(product: Id, tags: UpdateTags) {
    await this.prisma.tags.deleteMany({
      where: {
        Products: {
          id: product.id,
        },
      },
    });

    return await this.prisma.products
      .update({
        where: { id: product.id },
        data: {
          tag: {
            createMany: {
              data: tags.tag,
            },
          },
        },
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });
  }

  //use every instead of some if search have issues, can read prisma docs  https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#atomic-number-operations
  async searchProduct(params: {
    greaterthan: number;
    lessthan: number;
    take: number;
    searchQuery?: string;
    sortbyViews?: any;
    sortbyPrice: any;
    cursor?: Prisma.ProductsWhereUniqueInput;
  }) {
    const {
      searchQuery,
      greaterthan,
      lessthan,
      take,
      sortbyViews,
      sortbyPrice,
      cursor,
    } = params;
    if (cursor.id) {
      const search = await this.prisma.products
        .findMany({
          take: take,
          skip: 1,
          cursor: cursor,
          where: {
            OR: [
              {
                tag: {
                  some: {
                    tagName: {
                      contains: searchQuery ? searchQuery : undefined,
                      mode: 'insensitive',
                    },
                  },
                },
              },
              {
                ParentCategory: {
                  parentcategoryName: {
                    equals: searchQuery ? searchQuery : undefined,
                    mode: 'insensitive',
                  },
                },
              },
              {
                SubCategory: {
                  subcategoryName: {
                    equals: searchQuery ? searchQuery : undefined,
                  },
                },
              },
              {
                productName: {
                  contains: searchQuery ? searchQuery : undefined,
                  mode: 'insensitive',
                },
              },
              {
                brand: {
                  name: {
                    equals: searchQuery ? searchQuery : undefined,
                    mode: 'insensitive',
                  },
                },
              },
            ],
            AND: [
              {
                productDetails: {
                  some: {
                    productPrice: {
                      gte: greaterthan,
                      lte: lessthan,
                    },
                  },
                },
              },
            ],
          },
          include: {
            productImgs: true,
            productDetails: {
              where: { productPrice: { gte: greaterthan, lte: lessthan } },
              select: {
                id: true,
                productColor: true,
                productDiscount: true,
                productPrice: true,
                productQuantity: true,
                productSize: true,
                productsId: true,
              },
              orderBy: {
                productPrice: 'asc',
              },
            },
          },
          orderBy: { views: sortbyViews ? sortbyViews : undefined },
        })
        .catch((error) => {
          throw new BadRequestException();
        });
      if (sortbyPrice) {
        for (let i = 0; i < search.length; i++) {
          const element = search[i];
          let sum = 0;
          for (let i = 0; i < element.productDetails.length; i++) {
            const temp = element.productDetails[i];
            sum += temp.productPrice;
          }
          element['averagePrice'] = Math.round(
            sum / element.productDetails.length,
          );
        }
        if (sortbyViews) {
          search.sort(function (a: any, b: any) {
            if (a.views > b.views) return -1;
            if (a.views < b.views) return 1;
            if (a.averagePrice > b.averagePrice) return 1;
            if (a.averagePrice < b.averagePrice) return -1;
          });
        } else {
          search.sort((a: any, b: any) => a.averagePrice - b.averagePrice);
        }
      }
      return search;
    } else {
      const search = await this.prisma.products
        .findMany({
          take: take ? take : undefined,
          where: {
            OR: [
              {
                tag: {
                  some: {
                    tagName: {
                      contains: searchQuery ? searchQuery : undefined,
                      mode: 'insensitive',
                    },
                  },
                },
              },
              {
                ParentCategory: {
                  parentcategoryName: {
                    equals: searchQuery ? searchQuery : undefined,
                    mode: 'insensitive',
                  },
                },
              },
              {
                SubCategory: {
                  subcategoryName: {
                    equals: searchQuery ? searchQuery : undefined,
                  },
                },
              },
              {
                productName: {
                  contains: searchQuery ? searchQuery : undefined,
                  mode: 'insensitive',
                },
              },
              {
                brand: {
                  name: {
                    equals: searchQuery ? searchQuery : undefined,
                    mode: 'insensitive',
                  },
                },
              },
            ],
            AND: [
              {
                productDetails: {
                  some: {
                    productPrice: {
                      gte: greaterthan,
                      lte: lessthan,
                    },
                  },
                },
              },
            ],
          },
          include: {
            productImgs: true,
            productDetails: {
              where: { productPrice: { gte: greaterthan, lte: lessthan } },
              select: {
                id: true,
                productColor: true,
                productDiscount: true,
                productPrice: true,
                productQuantity: true,
                productSize: true,
                productsId: true,
              },
              orderBy: {
                productPrice: 'asc',
              },
            },
          },
          orderBy: { views: sortbyViews ? sortbyViews : undefined },
        })
        .catch((error) => {
          throw new BadRequestException();
        });
      if (sortbyPrice) {
        for (let i = 0; i < search.length; i++) {
          const element = search[i];
          let sum = 0;
          for (let i = 0; i < element.productDetails.length; i++) {
            const temp = element.productDetails[i];
            sum += temp.productPrice;
          }
          element['averagePrice'] = Math.round(
            sum / element.productDetails.length,
          );
        }
        if (sortbyViews) {
          search.sort(function (a: any, b: any) {
            if (a.views > b.views) return -1;
            if (a.views < b.views) return 1;
            if (a.averagePrice > b.averagePrice) return 1;
            if (a.averagePrice < b.averagePrice) return -1;
          });
        } else {
          search.sort((a: any, b: any) => a.averagePrice - b.averagePrice);
        }
      }
      return search;
    }
  }

  async searchProductcount(params: {
    searchQuery?: string;
    greaterthan: number;
    lessthan: number;
  }) {
    const { searchQuery, greaterthan, lessthan } = params;
    if (searchQuery) {
      const productsCount = await this.prisma.products
        .count({
          where: {
            OR: [
              {
                tag: {
                  some: {
                    tagName: {
                      contains: searchQuery ? searchQuery : undefined,
                      mode: 'insensitive',
                    },
                  },
                },
              },
              {
                ParentCategory: {
                  parentcategoryName: {
                    equals: searchQuery ? searchQuery : undefined,
                    mode: 'insensitive',
                  },
                },
              },
              {
                SubCategory: {
                  subcategoryName: {
                    equals: searchQuery ? searchQuery : undefined,
                    mode: 'insensitive',
                  },
                },
              },
              {
                productName: {
                  contains: searchQuery ? searchQuery : undefined,
                  mode: 'insensitive',
                },
              },
              {
                brand: {
                  name: {
                    equals: searchQuery ? searchQuery : undefined,
                    mode: 'insensitive',
                  },
                },
              },
            ],
            AND: [
              {
                productDetails: {
                  some: {
                    productPrice: {
                      gte: greaterthan,
                      lte: lessthan,
                    },
                  },
                },
              },
            ],
          },
        })
        .catch((error) => {
          throw new BadRequestException();
        });
      return productsCount;
    } else {
      const productsCount = await this.prisma.products
        .count({
          where: {
            productDetails: {
              some: {
                productPrice: {
                  gte: greaterthan,
                  lte: lessthan,
                },
              },
            },
          },
        })
        .catch((error) => {
          throw new BadRequestException();
        });
      return productsCount;
    }
  }
}
