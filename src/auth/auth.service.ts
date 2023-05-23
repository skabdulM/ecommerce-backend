import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, LoginDto } from '../dtos';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    try {
      const phone = dto.phone ? dto.phone.toString() : undefined;
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hash,
          name: {
            firstName: dto.firstName,
            middleName: dto.middleName,
            lastName: dto.lastName,
          },
          phone: phone,
        },
      });
      // delete user.hash;
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials Taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: LoginDto) {
    const user = await this.prisma.user
      .findUnique({
        where: {
          email: dto.email,
        },
      })
      .catch((error) => {
        throw new ForbiddenException('Invalid');
      });

    //compare user
    if (!user) throw new ForbiddenException('Credentials invalid');

    //compare password
    const passwordMatch = await argon.verify(user.hash, dto.password);

    if (!passwordMatch) throw new ForbiddenException('Credentials invalid');

    //delete user
    // delete user.hash;
    // return user
    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    {
      const payload = {
        sub: userId,
        email,
      };
      const secret = this.config.get('JWT_SECRET');

      const token = await this.jwt.signAsync(payload, {
        expiresIn: '24h',
        secret: secret,
      });
      return {
        access_token: token,
      };
    }
  }
}
