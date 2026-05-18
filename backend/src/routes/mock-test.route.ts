import { Router } from 'express';
import {
  createMockTestHandler,
  deleteMockTestHandler,
  getMockTestDetailHandler,
  getManagedMockTestsHandler,
  getMockTestsHandler,
  submitMockTestHandler,
  updateMockTestHandler,
} from '../controllers/mock-test.controller.js';
import { attachUserIfExists, verifyToken } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  createMockTestSchema,
  mockTestIdParamsSchema,
  submitMockTestSchema,
  updateMockTestSchema,
} from '../validations/mock-test.validation.js';

const mockTestRouter = Router();

mockTestRouter.get('/', attachUserIfExists, asyncHandler(getMockTestsHandler));
mockTestRouter.get('/manage/mine', verifyToken, checkRole('admin', 'teacher'), asyncHandler(getManagedMockTestsHandler));
mockTestRouter.get('/:id', attachUserIfExists, validate(mockTestIdParamsSchema), asyncHandler(getMockTestDetailHandler));
mockTestRouter.post('/', verifyToken, checkRole('admin', 'teacher'), validate(createMockTestSchema), asyncHandler(createMockTestHandler));
mockTestRouter.patch('/:id', verifyToken, checkRole('admin', 'teacher'), validate(updateMockTestSchema), asyncHandler(updateMockTestHandler));
mockTestRouter.delete('/:id', verifyToken, checkRole('admin', 'teacher'), validate(mockTestIdParamsSchema), asyncHandler(deleteMockTestHandler));
mockTestRouter.post(
  '/:id/submit',
  verifyToken,
  checkRole('student'),
  validate(submitMockTestSchema),
  asyncHandler(submitMockTestHandler),
);

export { mockTestRouter };
