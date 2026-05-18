import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const adminUserIdParamsSchema = {
  params: z.object({
    id: objectId,
  }),
};

export const updateAdminUserSchema = {
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
    email: z.email('Email is invalid').transform((value) => value.toLowerCase().trim()).optional(),
    role: z.enum(['student', 'teacher', 'admin']).optional(),
    avatarUrl: z.string().url('avatarUrl must be a valid URL').optional(),
    phone: z.string().min(8, 'Phone is invalid').max(20, 'Phone is invalid').optional(),
    bio: z.string().max(1000, 'Bio is too long').optional(),
    isActive: z.boolean().optional(),
  }),
};

export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema.body>;

