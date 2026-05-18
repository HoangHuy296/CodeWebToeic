import { Router } from 'express';
import {
  createPostHandler,
  deletePostHandler,
  getPostBySlugHandler,
  listPostsHandler,
  updatePostHandler,
} from '../controllers/post.controller.js';
import { attachUserIfExists, verifyToken } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import { createPostSchema, postIdParamsSchema, postSlugParamsSchema, updatePostSchema } from '../validations/post.validation.js';

const postRouter = Router();

postRouter.get('/', attachUserIfExists, asyncHandler(listPostsHandler));
postRouter.get('/:slug', attachUserIfExists, validate(postSlugParamsSchema), asyncHandler(getPostBySlugHandler));
postRouter.post('/', verifyToken, checkRole('admin'), validate(createPostSchema), asyncHandler(createPostHandler));
postRouter.patch('/:id', verifyToken, checkRole('admin'), validate(updatePostSchema), asyncHandler(updatePostHandler));
postRouter.delete('/:id', verifyToken, checkRole('admin'), validate(postIdParamsSchema), asyncHandler(deletePostHandler));

export { postRouter };

