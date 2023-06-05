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
  ConfimationEmail,
  ConfirmedEmail,
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
    const userDetails = {
      email: dto.email,
      hash: hash,
      name: { ...dto.name },
      phone: phone,
    };
    try {
      const user = await this.prisma.user.create({
        data: {
          ...userDetails,
          token: {
            create: {
              verificationToken: this.randomeNumber().toString(),
            },
          },
        },
        include: {
          token: {
            select: {
              verificationToken: true,
            },
          },
        },
      });
      delete user.hash;
      const sentEmail: ConfimationEmail = {
        email: user.email,
        name: user.name[0],
        authToken: user.token.verificationToken,
      };
      this.sendConfirmationEmail(sentEmail);
      //TEST for testing purposes comment out the delete user.authToken
      delete user.token;
      const jwt_token = await this.signToken(user.id, user.email);
      //COMMENT combining user and jwt token for login sending user is optional because token is being sent
      const temp = {
        ...user,
        //TEST  for testing purposes send this the delete user.authToken
        // token: user.token.verificationToken,
        ...jwt_token,
      };
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
      const token = await this.prisma.token.findUnique({
        where: {
          verificationToken: dto.code,
        },
        include: {
          user: true,
        },
      });

      if (!token || token.userId !== userId) {
        throw new ForbiddenException();
      }
      await this.prisma.user.update({
        where: {
          id: token.userId,
        },
        data: {
          token: {
            delete: true,
          },
          isVerified: true,
        },
      });

      const sentConfirmedEmail: ConfirmedEmail = {
        email: token.user.email,
        name: token.user.name[0],
      };
      this.sendConfirmedEmail(sentConfirmedEmail);
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
          token: {
            create: {
              verificationToken: this.randomeNumber().toString(),
            },
          },
        },
        include: {
          token: {
            select: {
              verificationToken: true,
            },
          },
        },
      });
      delete user.hash;
      const sentEmail: ConfimationEmail = {
        email: user.email,
        name: user.name[0],
        authToken: user.token.verificationToken,
      };
      this.sendConfirmationEmail(sentEmail);
      //TEST for testing purposes comment out the delete user.authToken
      delete user.token;
      const jwt_token = await this.signToken(user.id, user.email);
      //COMMENT combining user and jwt token for login
      const temp = {
        ...user,
        //TEST  for testing purposes send this the delete user.authToken
        // token: user.token.verificationToken,
        ...jwt_token,
      };
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
            token: {
              create: {
                verificationToken: this.randomeNumber().toString(),
              },
            },
          },
          include: {
            token: {
              select: {
                verificationToken: true,
              },
            },
          },
        });
        const sentEmail: ConfimationEmail = {
          email: user.email,
          name: user.name[0],
          authToken: user.token.verificationToken,
        };
        this.sendConfirmationEmail(sentEmail);
        //TEST only for testing purpose return user do not return in production
        // return { token: user.token.verificationToken };
        return 'Verification code sent';
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async forgotPasswordverify(dto: ForgotPassword) {
    try {
      const token = await this.prisma.token.findUnique({
        where: {
          verificationToken: dto.code,
        },
        include: {
          user: true,
        },
      });
      if (!token) {
        throw new UnauthorizedException();
      }
      const hash = await argon.hash(dto.newPassword);

      await this.prisma.user.update({
        where: {
          id: token.userId,
        },
        data: {
          hash: hash,
          token: {
            delete: true,
          },
        },
      });

      const sentConfirmedEmail: ConfirmedEmail = {
        email: token.user.email,
        name: token.user.name[0],
      };
      this.sendConfirmedEmail(sentConfirmedEmail);
      return await this.signToken(token.userId, token.user.email);
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
        include: {
          token: {
            select: {
              verificationToken: true,
            },
          },
        },
      });
      if (user.token != null) {
        const sentEmail: ConfimationEmail = {
          email: user.email,
          name: user.name[0],
          authToken: user.token.verificationToken,
        };
        await this.sendConfirmationEmail(sentEmail);
        //TEST for testing purposes returning user
        // return { token: user.token.verificationToken };
        return 'Verification code sent';
      }
      throw new BadRequestException();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async sendConfirmedEmail(user: ConfirmedEmail) {
    const {
      email,
      name: { firstName, middleName, lastName },
    } = await user;
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

  async sendConfirmationEmail(user: ConfimationEmail) {
    const {
      email,
      name: { firstName, middleName, lastName },
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
          code: user.authToken,
        },
      })
      .catch((e) => {
        throw new BadRequestException(e);
      });
  }
}
