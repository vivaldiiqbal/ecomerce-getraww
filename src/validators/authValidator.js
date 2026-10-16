import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama lengkap minimal 2 karakter.'),
  email: z.string().email('Format email tidak valid.'),
  phone: z.string().min(8, 'Nomor telepon minimal 8 digit.').optional(),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter.')
});

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid.'),
  password: z.string().min(1, 'Kata sandi tidak boleh kosong.')
});
