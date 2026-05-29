import { Router } from 'express';
import { getLearningDataHandler } from '../controllers/learning.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import { learningCourseParamsSchema } from '../validations/learning.validation.js';

const learningRouter = Router();

learningRouter.get(
  '/:courseId',
  verifyToken,
  checkRole('student'),
  validate(learningCourseParamsSchema),
  asyncHandler(getLearningDataHandler),
);

export { learningRouter };
