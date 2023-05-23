import { Injectable } from '@nestjs/common';
import { EditUserDto } from '../dtos';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async editUser(userId: string, dto: EditUserDto) {
    const userobj = {
      email: dto.email,
      name: {
        firstName: dto.firstName,
        middleName: dto.middleName,
      },
    };
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    delete user.hash;
    return user;
  }
}
