import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AddressDto, EditAddress, EditUserDto } from '../dtos';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUser(userId: string, address?: boolean) {
    const user = await this.prisma.user
      .findFirst({
        where: {
          id: userId,
        },
        include: {
          address: address ? true : false,
        },
      })
      .catch((error) => {
        throw new ForbiddenException('Credentials invalid');
      });

    delete user.hash;
    delete user.authToken;
    return user;
  }

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
    delete user.authToken;
    return user;
  }

  async addAddress(userId: string, dto: AddressDto) {
    const address = await this.prisma.address
      .create({
        data: {
          userId: userId,
          ...dto,
        },
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });
    return address;
  }

  async getAddress(userId: string, addressId: string) {
    const address = await this.prisma.address
      .findFirst({
        where: {
          id: addressId,
          userId: userId,
        },
      })
      .catch((error) => {
        throw new BadRequestException();
      });
    if (!address) throw new UnauthorizedException();
    return address;
  }

  async editAddress(userId: string, addressId: string, dto: EditAddress) {
    const address = await this.prisma.address
      .findFirst({
        where: {
          id: addressId,
        },
      })
      .catch((error) => {
        throw new BadRequestException();
      });

    if (!address || address.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    return this.prisma.address
      .update({
        where: {
          id: addressId,
        },
        data: {
          ...dto,
        },
      })
      .catch((error) => {
        throw new BadRequestException();
      });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address
      .findUnique({
        where: {
          id: addressId,
        },
      })
      .catch((error) => {
        throw new BadRequestException();
      });

    if (!address || address.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    await this.prisma.address
      .delete({
        where: {
          id: addressId,
        },
      })
      .catch((error) => {
        throw new BadRequestException();
      });
  }
}
