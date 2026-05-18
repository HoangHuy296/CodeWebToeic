import { Router } from 'express';
import {
  deactivateAdminUserHandler,
  getAdminStatsHandler,
  getAdminUserByIdHandler,
  getEnrollmentChartHandler,
  getRevenueChartHandler,
  listAdminUsersHandler,
  updateAdminUserHandler,
} from '../controllers/admin.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import { adminUserIdParamsSchema, updateAdminUserSchema } from '../validations/admin.validation.js';

const adminRouter = Router();

adminRouter.use(verifyToken, checkRole('admin'));

adminRouter.get('/stats', asyncHandler(getAdminStatsHandler));
adminRouter.get('/charts/revenue', asyncHandler(getRevenueChartHandler));
adminRouter.get('/charts/enrollments', asyncHandler(getEnrollmentChartHandler));
adminRouter.get('/users', asyncHandler(listAdminUsersHandler));
adminRouter.get('/users/:id', validate(adminUserIdParamsSchema), asyncHandler(getAdminUserByIdHandler));
adminRouter.patch('/users/:id', validate(updateAdminUserSchema), asyncHandler(updateAdminUserHandler));
adminRouter.delete('/users/:id', validate(adminUserIdParamsSchema), asyncHandler(deactivateAdminUserHandler));

export { adminRouter };

