import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ImageuploadModule } from './imageupload/imageupload.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProductModule,
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        secure: true,
        //BUG remove the email and password while comminting changes
        auth: {
          user: 'vancedabdulmannan@gmail.com',
          pass: 'dlcuberihvgadvdi',
        },
      },
      defaults: {
        from: '"No Reply" vancedabdulmannan@gmail.com',
      },
      template: {
        dir: join(__dirname, '../email-templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    CloudinaryModule,
    ImageuploadModule,
    CategoryModule,
    BrandModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
