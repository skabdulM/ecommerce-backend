import { Module } from '@nestjs/common';
import { ImageuploadController } from './imageupload.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [ImageuploadController],
  imports: [CloudinaryModule],
})
export class ImageuploadModule {}
