import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('image')
export class ImageuploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.uploadFile(file);
  }

  @Post('uploads')
  @UseInterceptors(FilesInterceptor('file[]', 5))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    let images = [];
    for (let i = 0; i < files.length; i++) {
      const data = await this.cloudinaryService
        .uploadFile(files[i])
        .catch((error) => {
          throw new BadRequestException(error);
        });
      images.push(data);
    }
    return images;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('delete/:publicId')
  async deleteImage(@Param('publicId') publicId: string) {
    return this.cloudinaryService.deleteImage(publicId);
  }
}
