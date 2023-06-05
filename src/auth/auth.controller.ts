import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  Email,
  ForgotPassword,
  LoginDto,
  SignUp,
  UpdatePassword,
  VerifyCode,
} from '../dtos';
import { GetUser } from './decorator';
import { JwtGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignUp) {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtGuard)
  @Post('verify')
  async Verify(@GetUser('id') userId: string, @Body() dto: VerifyCode) {
    return await this.authService.verifyAccount(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: LoginDto) {
    return this.authService.signin(dto);
  }

  @UseGuards(JwtGuard)
  @Post('update/email/req')
  async updateEmailReq(@GetUser('id') userId: string, @Body() dto: Email) {
    return this.authService.updateEmailReq(userId, dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('update/password')
  async updatePassword(
    @GetUser('id') userId: string,
    @Body() dto: UpdatePassword,
  ) {
    return this.authService.updatePassword(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgotpasswordreq')
  async forgotPasswordreq(@Body() dto: Email) {
    return this.authService.forgotPasswordreq(dto);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Post('forgotpasswordverify')
  async forgotPasswordverify(@Body() dto: ForgotPassword) {
    return this.authService.forgotPasswordverify(dto);
  }

  @Post('verification/resend')
  async resendVerification(@Body() dto: Email) {
    return this.authService.resendVerification(dto);
  }
}
