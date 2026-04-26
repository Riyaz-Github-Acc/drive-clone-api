import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(10),
  RESEND_API_KEY: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
