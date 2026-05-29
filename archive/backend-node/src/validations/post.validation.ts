import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

const createPostBodySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  excerpt: z.string().min(10, 'Excerpt is too short').max(320),
  content: z.string().min(20, 'Content is too short'),
  coverImage: z.string().url('coverImage must be a valid URL').optional(),
  tags: z.array(z.string().min(1)).optional().default([]),
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
  seoDescription: z.string().max(180, 'SEO description is too long').optional(),
});

const updatePostBodySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  excerpt: z.string().min(10, 'Excerpt is too short').max(320).optional(),
  content: z.string().min(20, 'Content is too short').optional(),
  coverImage: z.string().url('coverImage must be a valid URL').optional(),
  tags: z.array(z.string().min(1)).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  seoDescription: z.string().max(180, 'SEO description is too long').optional(),
});

export const createPostSchema = {
  body: createPostBodySchema,
};

export const updatePostSchema = {
  params: z.object({
    id: objectId,
  }),
  body: updatePostBodySchema,
};

export const postSlugParamsSchema = {
  params: z.object({
    slug: z.string().min(1, 'Slug is required'),
  }),
};

export const postIdParamsSchema = {
  params: z.object({
    id: objectId,
  }),
};

export type CreatePostInput = z.infer<typeof createPostBodySchema>;
export type UpdatePostInput = z.infer<typeof updatePostBodySchema>;

