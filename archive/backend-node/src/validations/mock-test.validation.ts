import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const mockTestTypeSchema = z.enum(['mini-test', 'full-test', 'practice-set']);
const mockTestLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);
const mockTestStatusSchema = z.enum(['draft', 'published', 'archived']);
const questionSectionSchema = z.enum(['listening', 'reading', 'speaking', 'writing', 'mixed']);
const questionLevelSchema = z.enum(['easy', 'medium', 'hard']);
const assignedCourseIdsSchema = z.array(objectId).optional().default([]);

const questionOptionSchema = z.object({
  key: z.string().min(1, 'Option key is required'),
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
});

const questionSchema = z
  .object({
    section: questionSectionSchema.default('mixed'),
    prompt: z.string().min(3, 'Prompt is required'),
    explanation: z.string().optional(),
    options: z.array(questionOptionSchema).min(2, 'Question must have at least 2 options'),
    correctAnswer: z.string().min(1, 'Correct answer is required'),
    audioUrl: z.string().url('audioUrl must be a valid URL').optional(),
    imageUrl: z.string().url('imageUrl must be a valid URL').optional(),
    points: z.number().int().min(1).default(1),
    order: z.number().int().min(1),
    level: questionLevelSchema.default('medium'),
  })
  .superRefine((value, ctx) => {
    const keys = new Set<string>();
    let correctOptionCount = 0;

    for (const option of value.options) {
      if (keys.has(option.key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate option key: ${option.key}`,
          path: ['options'],
        });
      }

      keys.add(option.key);

      if (option.isCorrect) {
        correctOptionCount += 1;
      }
    }

    if (!keys.has(value.correctAnswer)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'correctAnswer must match one of the option keys',
        path: ['correctAnswer'],
      });
    }

    if (correctOptionCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one option must be marked as correct',
        path: ['options'],
      });
    }
  });

const createMockTestBodySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description is too short'),
  type: mockTestTypeSchema,
  level: mockTestLevelSchema,
  durationMinutes: z.number().int().min(1),
  status: mockTestStatusSchema.optional().default('draft'),
  instructions: z.array(z.string().min(1)).optional().default([]),
  isFeatured: z.boolean().optional().default(false),
  assignedCourseIds: assignedCourseIdsSchema,
  questions: z.array(questionSchema).min(1, 'Mock test must have at least one question'),
});

const updateMockTestBodySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().min(10, 'Description is too short').optional(),
  type: mockTestTypeSchema.optional(),
  level: mockTestLevelSchema.optional(),
  durationMinutes: z.number().int().min(1).optional(),
  status: mockTestStatusSchema.optional(),
  instructions: z.array(z.string().min(1)).optional(),
  isFeatured: z.boolean().optional(),
  assignedCourseIds: z.array(objectId).optional(),
  questions: z.array(questionSchema).min(1).optional(),
});

export const createMockTestSchema = {
  body: createMockTestBodySchema,
};

export const updateMockTestSchema = {
  params: z.object({
    id: objectId,
  }),
  body: updateMockTestBodySchema,
};

export const mockTestIdParamsSchema = {
  params: z.object({
    id: objectId,
  }),
};

export const submitMockTestSchema = {
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    durationSeconds: z.number().int().min(0),
    answers: z.array(
      z.object({
        questionId: objectId,
        selectedOption: z.string().min(1, 'selectedOption is required'),
      }),
    ),
  }),
};

export type CreateMockTestInput = z.infer<typeof createMockTestBodySchema>;
export type UpdateMockTestInput = z.infer<typeof updateMockTestBodySchema>;
export type SubmitMockTestInput = z.infer<typeof submitMockTestSchema.body>;
