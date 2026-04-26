import { z } from 'zod';

export const JwtPayloadSchema = z.object({
  id: z.string(),
  role: z.enum(['admin', 'user']),
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
