import { z } from 'zod';

export const learningCourseParamsSchema = {
  params: z.object({
    courseId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid course id'),
  }),
};
