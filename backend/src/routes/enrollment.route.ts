import { Router } from 'express';
import {
  createEnrollmentHandler,
  getCourseEnrollmentsHandler,
  getMyEnrollmentsHandler,
  updateLearningProgressHandler,
} from '../controllers/enrollment.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  courseEnrollmentParamsSchema,
  createEnrollmentSchema,
  updateProgressSchema,
} from '../validations/enrollment.validation.js';

const enrollmentRouter = Router();

enrollmentRouter.post(
  '/',
  verifyToken,
  checkRole('student'),
  validate(createEnrollmentSchema),
  asyncHandler(createEnrollmentHandler),
);
enrollmentRouter.get(
  '/me',
  verifyToken,
  checkRole('student'),
  asyncHandler(getMyEnrollmentsHandler),
);
enrollmentRouter.get(
  '/course/:courseId',
  verifyToken,
  checkRole('teacher', 'admin'),
  validate(courseEnrollmentParamsSchema),
  asyncHandler(getCourseEnrollmentsHandler),
);
enrollmentRouter.patch(
  '/:courseId/progress',
  verifyToken,
  checkRole('student'),
  validate(updateProgressSchema),
  asyncHandler(updateLearningProgressHandler),
);

export { enrollmentRouter };

