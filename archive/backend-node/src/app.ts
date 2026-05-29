import express from 'express';
import { adminRouter } from './routes/admin.route.js';
import { errorHandler } from './middlewares/error-handler.middleware.js';
import { notFoundMiddleware } from './middlewares/not-found.middleware.js';
import { applySecurityMiddlewares } from './middlewares/security.middleware.js';
import { authRouter } from './routes/auth.route.js';
import { courseRouter, lessonRouter } from './routes/course.route.js';
import { enrollmentRouter } from './routes/enrollment.route.js';
import { learningRouter } from './routes/learning.route.js';
import { messageRouter } from './routes/message.route.js';
import { mockTestRouter } from './routes/mock-test.route.js';
import { postRouter } from './routes/post.route.js';
import { systemRouter } from './routes/system.route.js';

export function createApp() {
  const app = express();

  applySecurityMiddlewares(app);
  app.use(systemRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/courses', courseRouter);
  app.use('/api/lessons', lessonRouter);
  app.use('/api/enrollments', enrollmentRouter);
  app.use('/api/learning', learningRouter);
  app.use('/api/mock-tests', mockTestRouter);
  app.use('/api/posts', postRouter);
  app.use('/api/messages', messageRouter);
  app.use(notFoundMiddleware);
  app.use(errorHandler);

  return app;
}
