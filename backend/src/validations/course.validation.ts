import { z } from 'zod';

const objectIdParam = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id'),
});

const courseIdParam = z.object({
  courseId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid course id'),
});

const courseLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);
const videoProviderSchema = z.enum(['youtube', 'vimeo', 'cloudinary', 'bunny', 's3', 'other']);
const reviewStatusSchema = z.enum(['pending_review', 'changes_requested', 'rejected', 'approved']);

const materialSchema = z.object({
  title: z.string().min(1, 'Material title is required'),
  fileUrl: z.string().url('Material fileUrl must be a valid URL'),
  fileType: z.string().optional(),
});

const videoSchema = z.object({
  videoUrl: z.string().url('videoUrl must be a valid URL'),
  videoProvider: videoProviderSchema,
  duration: z.number().min(0).optional(),
  thumbnail: z.string().url('thumbnail must be a valid URL').optional(),
});

const createCourseBodySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  shortDescription: z.string().min(10, 'Short description is too short').max(300),
  description: z.string().min(20, 'Description is too short'),
  category: z.string().min(2, 'Category is required'),
  level: courseLevelSchema,
  price: z.number().min(0),
  salePrice: z.number().min(0).optional(),
  thumbnail: z.string().url('thumbnail must be a valid URL'),
  introVideo: videoSchema,
  materials: z.array(materialSchema).optional().default([]),
  tags: z.array(z.string().min(1)).optional().default([]),
  benefits: z.array(z.string().min(1)).optional().default([]),
  isPublished: z.boolean().optional().default(false),
  reviewStatus: reviewStatusSchema.optional(),
  reviewNote: z.string().max(1000).optional(),
});

const updateCourseBodySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  shortDescription: z.string().min(10, 'Short description is too short').max(300).optional(),
  description: z.string().min(20, 'Description is too short').optional(),
  category: z.string().min(2, 'Category is required').optional(),
  level: courseLevelSchema.optional(),
  price: z.number().min(0).optional(),
  salePrice: z.number().min(0).optional(),
  thumbnail: z.string().url('thumbnail must be a valid URL').optional(),
  introVideo: videoSchema.optional(),
  materials: z.array(materialSchema).optional(),
  tags: z.array(z.string().min(1)).optional(),
  benefits: z.array(z.string().min(1)).optional(),
  isPublished: z.boolean().optional(),
  reviewStatus: reviewStatusSchema.optional(),
  reviewNote: z.string().max(1000).optional(),
});

const createLessonBodySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  description: z.string().min(10, 'Description is too short'),
  content: z.string().optional(),
  video: videoSchema,
  order: z.number().int().min(1),
  isPreview: z.boolean().optional().default(false),
  materials: z.array(materialSchema).optional().default([]),
});

const updateLessonBodySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  description: z.string().min(10, 'Description is too short').optional(),
  content: z.string().optional(),
  video: videoSchema.optional(),
  order: z.number().int().min(1).optional(),
  isPreview: z.boolean().optional(),
  materials: z.array(materialSchema).optional(),
});

export const createCourseSchema = {
  body: createCourseBodySchema,
};

export const updateCourseSchema = {
  params: objectIdParam,
  body: updateCourseBodySchema,
};

export const getCourseBySlugSchema = {
  params: z.object({
    slug: z.string().min(1, 'Slug is required'),
  }),
};

export const createLessonSchema = {
  params: courseIdParam,
  body: createLessonBodySchema,
};

export const updateLessonSchema = {
  params: objectIdParam,
  body: updateLessonBodySchema,
};

export const deleteCourseSchema = {
  params: objectIdParam,
};

export const deleteLessonSchema = {
  params: objectIdParam,
};

export type CreateCourseInput = z.infer<typeof createCourseSchema.body>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema.body>;
export type CreateLessonInput = z.infer<typeof createLessonSchema.body>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema.body>;
