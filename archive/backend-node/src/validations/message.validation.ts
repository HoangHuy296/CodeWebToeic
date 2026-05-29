import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const createMessageSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Email is invalid').transform((value) => value.toLowerCase().trim()),
    phone: z.string().min(8, 'Phone is invalid').max(20, 'Phone is invalid').optional(),
    subject: z.string().min(3, 'Subject must be at least 3 characters'),
    content: z.string().min(10, 'Content is too short'),
  }),
};

export const createInternalMessageSchema = {
  body: z.object({
    recipientUserId: objectId,
    subject: z.string().min(3, 'Subject must be at least 3 characters'),
    content: z.string().min(10, 'Content is too short'),
  }),
};

export const markMessageReadSchema = {
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    status: z.enum(['read', 'replied']).optional().default('read'),
  }),
};

export type CreateMessageInput = z.infer<typeof createMessageSchema.body>;
export type CreateInternalMessageInput = z.infer<typeof createInternalMessageSchema.body>;
export type MarkMessageReadInput = z.infer<typeof markMessageReadSchema.body>;
