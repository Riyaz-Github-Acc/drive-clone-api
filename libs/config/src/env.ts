import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(10),
  RESEND_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
