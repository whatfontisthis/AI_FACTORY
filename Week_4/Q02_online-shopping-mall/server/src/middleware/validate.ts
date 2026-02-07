import { z, ZodSchema } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        error: 'Invalid query parameters',
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    next();
  };
}

// --- Schemas ---

export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
  selectedOptions: z.record(z.string(), z.string()).optional(),
});

export const updateCartSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export const createOrderSchema = z.object({
  shippingAddressId: z.string().uuid(),
});

export const createAddressSchema = z.object({
  label: z.string().min(1).max(20),
  recipient: z.string().min(1).max(50),
  phone: z.string().min(1).max(20),
  zipCode: z.string().min(1).max(10),
  address1: z.string().min(1).max(200),
  address2: z.string().max(200).optional().default(''),
  isDefault: z.boolean().optional().default(true),
});

export const productsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().max(100).optional(),
  sort: z.enum(['', 'price_asc', 'price_desc', 'rating']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(20),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  min_rating: z.coerce.number().min(0).max(5).optional(),
  rocket_only: z.enum(['true', 'false']).optional(),
});
