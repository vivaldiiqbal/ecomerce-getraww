import { z } from 'zod';

const cartItemSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)),
  size: z.string().min(1, 'Ukuran produk wajib diisi.'),
  quantity: z.number().int().positive('Jumlah minimal 1.')
}).passthrough();

export const checkoutCalculateSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'Keranjang belanja tidak boleh kosong.'),
  promoCode: z.string().optional(),
  shippingMethod: z.enum(['regular', 'express', 'pickup']).optional().default('regular')
});

export const checkoutOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'Keranjang belanja tidak boleh kosong.'),
  customer: z.object({
    name: z.string().min(2, 'Nama pelanggan minimal 2 karakter.'),
    email: z.string().email('Email tidak valid.').optional().or(z.literal('')),
    phone: z.string().min(8, 'Nomor HP minimal 8 digit.'),
    address: z.string().min(5, 'Alamat pengiriman minimal 5 karakter.')
  }),
  paymentMethod: z.string().optional().default('QRIS INSTANT'),
  shippingMethod: z.string().optional().default('JNE REG'),
  promoCode: z.string().optional()
}).passthrough();

export const simulatePaySchema = z.object({
  orderNumber: z.string().min(5, 'Nomor pesanan wajib diisi.')
});

