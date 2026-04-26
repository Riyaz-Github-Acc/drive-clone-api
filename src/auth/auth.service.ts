import { env } from '@app/config/env';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from 'libs/drizzle';
import { admins, users } from 'libs/drizzle/schema';
import { Resend } from 'resend';

const resend = new Resend(env.RESEND_API_KEY);

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async createAdmin(email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    await db.insert(admins).values({ email, password: hashed });
    return { message: 'Admin created successfully' };
  }

  async adminLogin(email: string, password: string) {
    const admin = await db.query.admins.findFirst({
      where: eq(admins.email, email),
    });
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.jwtService.sign({
      id: admin.id,
      email: admin.email,
      role: 'admin',
    });
  }

  async sendOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db
      .insert(users)
      .values({ email, otpCode: otp, otpExpiresAt: expiresAt })
      .onConflictDoUpdate({
        target: users.email,
        set: { otpCode: otp, otpExpiresAt: expiresAt },
      });

    const mailRes = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'riyazfreelanceacc@gmail.com',
      subject: 'Your OTP',
      html: `<p>Your OTP is <strong>${otp}</strong>. Valid for 10 minutes.</p>`,
    });

    console.log(mailRes, 'MailRes122');

    return { message: 'OTP sent' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || !user.otpCode || !user.otpExpiresAt) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    if (user.otpCode !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await db
      .update(users)
      .set({ otpCode: null, otpExpiresAt: null })
      .where(eq(users.email, email));

    return this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: 'user',
    });
  }
}
