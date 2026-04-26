import {
  AdminLoginSchema,
  SendOtpSchema,
  VerifyOtpSchema,
} from 'libs/types/auth.type';
import { createZodDto } from 'nestjs-zod';

export class AdminLoginDto extends createZodDto(AdminLoginSchema) {}
export class SendOtpDto extends createZodDto(SendOtpSchema) {}
export class VerifyOtpDto extends createZodDto(VerifyOtpSchema) {}
