import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  cleaDb() {
    return this.$transaction([
      // this.user.deleteMany(),
      // this.token.deleteMany(),
      this.image.deleteMany(),
      this.productDetails.deleteMany(),
      this.products.deleteMany(),
    ]);
  }
}
