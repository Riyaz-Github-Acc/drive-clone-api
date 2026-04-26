import { z } from 'zod';

export const adminSchema = z
  .object({
    id: z.uuid(),
    email: z.email(),
    password: z.string().min(6),
    createdAt: z.string(),
  })
  .meta({ id: 'Admin' });

export type Admin = z.infer<typeof adminSchema>;

export const AdminLoginSchema = adminSchema
  .omit({
    id: true,
    createdAt: true,
  })
  .meta({ id: 'AdminLogin' });

export type AdminLogin = z.infer<typeof AdminLoginSchema>;

export const userSchema = z
  .object({
    id: z.uuid(),
    email: z.email(),
    otpCode: z.string().nullable(),
    otpExpiresAt: z.string().nullable(),
    createdAt: z.string(),
  })
  .meta({ id: 'User' });

export type User = z.infer<typeof userSchema>;

export const SendOtpSchema = userSchema
  .pick({ email: true })
  .meta({ id: 'SendOtp' });

export type SendOtp = z.infer<typeof SendOtpSchema>;

export const VerifyOtpSchema = userSchema
  .pick({ email: true, otpCode: true })
  .meta({ id: 'VerifyOtp' });

export type VerifyOtp = z.infer<typeof VerifyOtpSchema>;
