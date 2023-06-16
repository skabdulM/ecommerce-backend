import {
  Controller,
  Delete,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Roles } from 'src/auth/decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';

@Controller('image')
export class ImageuploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Roles('MANAGER', 'ADMIN')
  @UseGuards(JwtGuard, RolesGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.uploadFile(file);
  }

  @Roles('MANAGER', 'ADMIN')
  @UseGuards(JwtGuard, RolesGuard)
  @Post('uploads')
  @UseInterceptors(FilesInterceptor('images[]', 10))
  async uploadImages(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    let images = [];
    for (let i = 0; i < files.length; i++) {
      const data = await this.cloudinaryService.uploadFile(files[i]);
      images.push(data);
    }
    return images;
  }

  @Roles('MANAGER', 'ADMIN')
  @UseGuards(JwtGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('delete/:publicId')
  async deleteImage(@Param('publicId') publicId: string) {
    return this.cloudinaryService.deleteImage(publicId);
  }
}
