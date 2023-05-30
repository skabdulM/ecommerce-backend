import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Email,
  ForgotPassword,
  LoginDto,
  SignUp,
  UpdatePassword,
  VerifyCode,
} from '../dtos';
import * as argon from 'argon2';
//NOTE use this import for prisma client know req
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailerService: MailerService,
  ) {}

  private randomeNumber() {
    const temp = Math.floor(100000 + Math.random() * 900000);
    return temp;
  }

  async signup(dto: SignUp) {
    const hash = await argon.hash(dto.password);
    const phone = dto.phone ? dto.phone.toString() : undefined;
    const authcode = this.randomeNumber().toString();
    const userDetails = {
      email: dto.email,
      hash: hash,
      name: { ...dto.name },
      authToken: authcode,
      phone: phone,
    };
    try {
      const user = await this.prisma.user.create({
        data: {
          ...userDetails,
        },
      });
      delete user.hash;
      //NOTE for testing purposes comment out the delete user.authToken
      // delete user.authToken;
      await this.sendConfirmationEmail(user);
      const jwt_token = await this.signToken(user.id, user.email);
      //COMMENT combining user and jwt token for login
      const temp = { ...user, ...jwt_token };
      return temp;
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

    if (!user) throw new ForbiddenException('Credentials invalid');

    //COMMENT compare password
    const passwordMatch = await argon.verify(user.hash, dto.password);

    if (!passwordMatch) throw new ForbiddenException('Credentials invalid');

    return this.signToken(user.id, user.email);
  }

  async verifyAccount(userId: string, dto: VerifyCode) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          authToken: {
            equals: dto.code,
          },
        },
      });

      if (!user || user.id !== userId) {
        throw new HttpException(
          'Verification code has not found or does not match',
          HttpStatus.UNAUTHORIZED,
        );
      }
      await this.prisma.user.update({
        where: {
          authToken: dto.code,
        },
        data: { authToken: undefined, isVerified: true },
      });

      delete user.hash;
      await this.sendConfirmedEmail(user);
      return HttpStatus.ACCEPTED;
    } catch (e) {
      throw new UnauthorizedException(e);
    }
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

  async updateEmailReq(userId: string, dto: Email) {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          email: dto.email,
          isVerified: false,
          authToken: this.randomeNumber().toString(),
        },
      });
      delete user.hash;
      //NOTE for testing purposes comment out the delete user.authToken
      // delete user.authToken
      await this.sendConfirmationEmail(user);
      const jwt_token = await this.signToken(user.id, user.email);
      //COMMENT combining user and jwt token for login
      const temp = { ...user, ...jwt_token };
      return temp;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials Taken');
        }
      }
      throw new BadRequestException(error);
    }
  }

  async updatePassword(userId: string, dto: UpdatePassword) {
    const user = await this.prisma.user
      .findUnique({
        where: { id: userId },
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });
    if (!user) throw new ForbiddenException('Credentials invalid');
    const passwordMatch = await argon.verify(user.hash, dto.password);
    if (!passwordMatch) throw new ForbiddenException('Credentials invalid');
    const hash = await argon.hash(dto.newPassword);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hash,
      },
    });
    return HttpStatus.OK;
  }

  async forgotPasswordreq(dto: Email) {
    try {
      const email = this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      if (email) {
        const user = await this.prisma.user.update({
          where: {
            email: dto.email,
          },
          data: {
            authToken: this.randomeNumber().toString(),
          },
        });
        delete user.hash;
        await this.sendConfirmationEmail(user);
        //NOTE only for testing purpose return user do not return in production
        return user;
        // return HttpStatus.FOUND;
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async forgotPasswordverify(dto: ForgotPassword) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          authToken: {
            equals: dto.code,
          },
        },
      });
      // || user.id !== userId
      if (!user) {
        throw new HttpException(
          'Verification code has not found or does not match',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const hash = await argon.hash(dto.newPassword);

      await this.prisma.user.update({
        where: {
          authToken: dto.code,
        },
        data: { authToken: undefined, hash: hash },
      });

      delete user.hash;
      await this.sendConfirmedEmail(user);
      return await this.signToken(user.id, user.email);
    } catch (e) {
      throw new UnauthorizedException(e);
    }
  }

  async resendVerification(dto: Email) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      delete user.hash;
      //NOTE for testing purposes comment out the delete user.authToken
      // delete user.authToken
      if (user.authToken != null) {
        await this.sendConfirmationEmail(user);
        return user;
      }
      throw new BadRequestException();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async sendConfirmedEmail(user: any) {
    const {
      email,
      name: { firstName, lastName, middleName },
    } = user;
    const fullName = firstName + ' ' + middleName + ' ' + lastName;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Ecommerce_backend your email has been confirmed',
      template: 'confirmed',
      context: {
        fullName,
        email,
      },
    });
  }

  async sendConfirmationEmail(user: any) {
    const {
      email,
      name: { firstName, lastName, middleName },
    } = await user;
    const fullName = firstName + ' ' + middleName + ' ' + lastName;

    await this.mailerService
      .sendMail({
        to: email,
        subject: 'Welcome to Ecommerce_backend please confirm your Email',
        template: 'confirm',
        context: {
          fullName,
          email,
          code: this.randomeNumber(),
        },
      })
      .catch((e) => {
        throw new BadRequestException(e);
      });
  }
}
