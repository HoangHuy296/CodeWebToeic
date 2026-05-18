import { Router } from 'express';
import {
  createInternalMessageHandler,
  createMessageHandler,
  listMessageRecipientsHandler,
  listMessagesHandler,
  markMessageReadHandler,
} from '../controllers/message.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import { createInternalMessageSchema, createMessageSchema, markMessageReadSchema } from '../validations/message.validation.js';

const messageRouter = Router();

messageRouter.get('/', verifyToken, checkRole('student', 'teacher', 'admin'), asyncHandler(listMessagesHandler));
messageRouter.get(
  '/recipients',
  verifyToken,
  checkRole('admin', 'teacher', 'student'),
  asyncHandler(listMessageRecipientsHandler),
);
messageRouter.post('/', validate(createMessageSchema), asyncHandler(createMessageHandler));
messageRouter.post(
  '/internal',
  verifyToken,
  checkRole('admin', 'teacher', 'student'),
  validate(createInternalMessageSchema),
  asyncHandler(createInternalMessageHandler),
);
messageRouter.patch('/:id/read', verifyToken, checkRole('student', 'teacher', 'admin'), validate(markMessageReadSchema), asyncHandler(markMessageReadHandler));

export { messageRouter };
