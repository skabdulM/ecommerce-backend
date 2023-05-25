import {
  BadRequestException,
  Injectable,
  MethodNotAllowedException,
} from '@nestjs/common';
import { EditUserDto } from '../dtos';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async editUser(userId: string, dto: EditUserDto) {
    const user = await this.prisma.user
      .update({
        where: {
          id: userId,
        },
        data: {
          ...dto,
        },
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });

    delete user.hash;
    return user;
  }
}
