import { Router } from 'express';
import {
  createCourseHandler,
  createLessonHandler,
  deleteCourseHandler,
  deleteLessonHandler,
  getCourseDetail,
  getCourses,
  getManageCoursesHandler,
  updateCourseHandler,
  updateLessonHandler,
} from '../controllers/course.controller.js';
import { attachUserIfExists, verifyToken } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  createCourseSchema,
  createLessonSchema,
  deleteCourseSchema,
  deleteLessonSchema,
  getCourseBySlugSchema,
  updateCourseSchema,
  updateLessonSchema,
} from '../validations/course.validation.js';

const courseRouter = Router();

courseRouter.get('/', asyncHandler(getCourses));
courseRouter.get('/manage/mine', verifyToken, checkRole('teacher', 'admin'), asyncHandler(getManageCoursesHandler));
courseRouter.get('/:slug', attachUserIfExists, validate(getCourseBySlugSchema), asyncHandler(getCourseDetail));
courseRouter.post('/', verifyToken, checkRole('admin', 'teacher'), validate(createCourseSchema), asyncHandler(createCourseHandler));
courseRouter.patch('/:id', verifyToken, checkRole('admin', 'teacher'), validate(updateCourseSchema), asyncHandler(updateCourseHandler));
courseRouter.delete('/:id', verifyToken, checkRole('admin'), validate(deleteCourseSchema), asyncHandler(deleteCourseHandler));
courseRouter.post(
  '/:courseId/lessons',
  verifyToken,
  checkRole('admin', 'teacher'),
  validate(createLessonSchema),
  asyncHandler(createLessonHandler),
);

const lessonRouter = Router();

lessonRouter.patch('/:id', verifyToken, checkRole('admin', 'teacher'), validate(updateLessonSchema), asyncHandler(updateLessonHandler));
lessonRouter.delete('/:id', verifyToken, checkRole('admin', 'teacher'), validate(deleteLessonSchema), asyncHandler(deleteLessonHandler));

export { courseRouter, lessonRouter };
