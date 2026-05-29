import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';
import { createPost, deletePost, getPostBySlug, listPosts, updatePost } from '../services/post.service.js';
import { emitActionFailure } from '../services/notification-events.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function listPostsHandler(req: Request, res: Response): Promise<Response> {
  const data = await listPosts(req.user);
  return sendSuccess(res, HTTP_STATUS.OK, 'Posts fetched successfully', data);
}

export async function getPostBySlugHandler(req: Request, res: Response): Promise<Response> {
  const data = await getPostBySlug(String(req.params.slug), req.user);
  return sendSuccess(res, HTTP_STATUS.OK, 'Post fetched successfully', data);
}

export async function createPostHandler(req: Request, res: Response): Promise<Response> {
  try {
    const data = await createPost(req.body, req.user!);
    return sendSuccess(res, HTTP_STATUS.CREATED, 'Post created successfully', data);
  } catch (error) {
    emitActionFailure(req.user!, 'Tao bai viet that bai', 'Khong the khoi tao bai viet voi du lieu vua nhap.', 'post');
    throw error;
  }
}

export async function updatePostHandler(req: Request, res: Response): Promise<Response> {
  const data = await updatePost(String(req.params.id), req.body);
  return sendSuccess(res, HTTP_STATUS.OK, 'Post updated successfully', data);
}

export async function deletePostHandler(req: Request, res: Response): Promise<Response> {
  await deletePost(String(req.params.id));
  return sendSuccess(res, HTTP_STATUS.OK, 'Post deleted successfully', {});
}
