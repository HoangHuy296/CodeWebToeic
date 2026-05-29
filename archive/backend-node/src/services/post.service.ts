// Public blog CRUD and editorial-state management for admin content workflows.
import { BlogPost } from '../models/index.js';
import { BlogPostHydratedDocument } from '../models/blog-post.model.js';
import { AuthUser } from '../types/auth.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { ApiError } from '../utils/api-error.js';
import { toSlug } from '../utils/slug.js';
import { CreatePostInput, UpdatePostInput } from '../validations/post.validation.js';
import { emitPostCreated } from './notification-events.service.js';

function mapPost(post: BlogPostHydratedDocument) {
  const author = post.author as unknown;

  return {
    id: post._id.toString(),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    tags: post.tags,
    status: post.status,
    seoDescription: post.seoDescription,
    publishedAt: post.publishedAt,
    author:
      author && typeof author === 'object' && '_id' in (author as Record<string, unknown>)
        ? {
            id: String((author as { _id: unknown })._id),
            fullName:
              'fullName' in (author as Record<string, unknown>)
                ? String((author as { fullName?: unknown }).fullName ?? '')
                : undefined,
            email:
              'email' in (author as Record<string, unknown>)
                ? String((author as { email?: unknown }).email ?? '')
                : undefined,
          }
        : { id: String(post.author) },
  };
}

async function ensureUniquePostSlug(slug: string, excludePostId?: string) {
  const existing = await BlogPost.findOne({
    slug,
    ...(excludePostId ? { _id: { $ne: excludePostId } } : {}),
  });

  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Post slug already exists');
  }
}

async function findPostByIdOrThrow(postId: string) {
  const post = await BlogPost.findById(postId).populate('author', 'fullName email');

  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Post not found');
  }

  return post;
}

export async function listPosts(user?: AuthUser) {
  const query =
    user?.role === 'admin'
      ? BlogPost.find()
      : BlogPost.find({ status: 'published' as const });
  const posts = (await query
    .populate('author', 'fullName email')
    .sort({ publishedAt: -1, createdAt: -1 })) as BlogPostHydratedDocument[];
  return posts.map((post) => mapPost(post));
}

export async function getPostBySlug(slug: string, user?: AuthUser) {
  const post = await BlogPost.findOne({ slug }).populate('author', 'fullName email');

  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Post not found');
  }

  if (post.status !== 'published' && user?.role !== 'admin') {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Post not found');
  }

  return mapPost(post);
}

export async function createPost(input: CreatePostInput, user: AuthUser) {
  const slug = toSlug(input.slug ?? input.title);
  await ensureUniquePostSlug(slug);

  const post = await BlogPost.create({
    ...input,
    slug,
    author: user.userId,
    publishedAt: input.status === 'published' ? new Date() : undefined,
  });

  const created = await findPostByIdOrThrow(post._id.toString());
  emitPostCreated(user, {
    id: created._id.toString(),
    title: created.title,
    status: created.status,
  });
  return mapPost(created);
}

export async function updatePost(postId: string, input: UpdatePostInput) {
  const post = await findPostByIdOrThrow(postId);
  const nextSlug = input.slug ? toSlug(input.slug) : input.title ? toSlug(input.title) : undefined;

  if (nextSlug && nextSlug !== post.slug) {
    await ensureUniquePostSlug(nextSlug, postId);
  }

  const nextStatus = input.status ?? post.status;

  Object.assign(post, {
    ...(typeof input.title === 'string' ? { title: input.title } : {}),
    ...(typeof input.excerpt === 'string' ? { excerpt: input.excerpt } : {}),
    ...(typeof input.content === 'string' ? { content: input.content } : {}),
    ...(typeof input.coverImage === 'string' ? { coverImage: input.coverImage } : {}),
    ...(input.tags ? { tags: input.tags } : {}),
    ...(typeof input.seoDescription === 'string' ? { seoDescription: input.seoDescription } : {}),
    ...(typeof input.status === 'string' ? { status: input.status } : {}),
    ...(nextSlug ? { slug: nextSlug } : {}),
    publishedAt:
      nextStatus === 'published'
        ? post.publishedAt ?? new Date()
        : undefined,
  });

  await post.save();
  return mapPost(post);
}

export async function deletePost(postId: string) {
  const post = await BlogPost.findById(postId);

  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Post not found');
  }

  await post.deleteOne();
}
