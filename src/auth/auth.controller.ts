import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AdminLoginDto, SendOtpDto, VerifyOtpDto } from 'libs/dto/auth.dto';

import { AuthService } from './auth.service';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/create')
  @ApiOperation({ summary: 'Create admin account' })
  createAdmin(@Body() body: AdminLoginDto) {
    return this.authService.createAdmin(body.email, body.password);
  }

  @Post('admin/login')
  @ApiOperation({ summary: 'Admin login' })
  async adminLogin(
    @Body() body: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.adminLogin(body.email, body.password);
    res.cookie('token', token, COOKIE_OPTIONS);
    return { message: 'Logged in successfully' };
  }

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to user email' })
  sendOtp(@Body() body: SendOtpDto) {
    return this.authService.sendOtp(body.email);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and get JWT token' })
  async verifyOtp(
    @Body() body: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.verifyOtp(body.email, body.otpCode!);
    res.cookie('token', token, COOKIE_OPTIONS);
    return { message: 'Logged in successfully' };
  }
}
