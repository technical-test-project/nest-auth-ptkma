import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(3, {
    message: 'Name is required and must be at least 3 character long',
  }),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
