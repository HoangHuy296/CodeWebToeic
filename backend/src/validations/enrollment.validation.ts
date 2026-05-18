import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const createEnrollmentSchema = {
  body: z.object({
    courseId: objectId,
  }),
};

export const courseEnrollmentParamsSchema = {
  params: z.object({
    courseId: objectId,
  }),
};

export const updateProgressSchema = {
  params: z.object({
    courseId: objectId,
  }),
  body: z.object({
    lessonId: objectId,
    watchedSeconds: z.number().min(0).optional(),
    isCompleted: z.boolean().optional(),
    lastAccessedAt: z.string().datetime().optional(),
  }),
};

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema.body>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema.body>;

