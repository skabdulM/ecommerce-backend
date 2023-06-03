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
} from '../dtos/index';
import { GetUser } from './decorator';
import { JwtGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignUp) {
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
  updateEmailReq(@GetUser('id') userId: string, @Body() dto: Email) {
    return this.authService.updateEmailReq(userId, dto);
  }

  @UseGuards(JwtGuard)
  @Post('update/password')
  updatePassword(@GetUser('id') userId: string, @Body() dto: UpdatePassword) {
    return this.authService.updatePassword(userId, dto);
  }

  @HttpCode(HttpStatus.FOUND)
  @Post('forgotpasswordreq')
  forgotPasswordreq(@Body() dto: Email) {
    return this.authService.forgotPasswordreq(dto);
  }

  @Post('forgotpasswordverify')
  forgotPasswordverify(@Body() dto: ForgotPassword) {
    return this.authService.forgotPasswordverify(dto);
  }

  @Post('verification/resend')
  resendVerification(@Body() dto: Email) {
    return this.authService.resendVerification(dto);
  }
}
