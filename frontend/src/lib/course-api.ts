import { api, unwrapResponse } from './api';
import type { Course } from '../types/course';
import type { VideoMetadata } from '../types/course';

export interface CourseMaterialPayload {
  title: string;
  fileUrl: string;
  fileType?: string;
}

export interface CreateCoursePayload {
  title: string;
  slug?: string;
  shortDescription: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  salePrice?: number;
  thumbnail: string;
  introVideo: VideoMetadata;
  materials?: CourseMaterialPayload[];
  tags?: string[];
  benefits?: string[];
  isPublished?: boolean;
  reviewStatus?: 'pending_review' | 'changes_requested' | 'rejected' | 'approved';
  reviewNote?: string;
}

export interface CreateLessonPayload {
  title: string;
  slug?: string;
  description: string;
  content?: string;
  video: VideoMetadata;
  order: number;
  isPreview?: boolean;
  materials?: CourseMaterialPayload[];
}

export type UpdateLessonPayload = Partial<CreateLessonPayload>;

export const courseApi = {
  list() {
    return unwrapResponse<Course[]>(api.get('/courses'));
  },
  detail(slug: string) {
    return unwrapResponse<Course>(api.get(`/courses/${slug}`));
  },
  manageMine() {
    return unwrapResponse<Course[]>(api.get('/courses/manage/mine'));
  },
  create(payload: CreateCoursePayload) {
    return unwrapResponse<Course>(api.post('/courses', payload));
  },
  update(id: string, payload: Partial<CreateCoursePayload>) {
    return unwrapResponse<Course>(api.patch(`/courses/${id}`, payload));
  },
  remove(id: string) {
    return unwrapResponse<Record<string, never>>(api.delete(`/courses/${id}`));
  },
  createLesson(courseId: string, payload: CreateLessonPayload) {
    return unwrapResponse(api.post(`/courses/${courseId}/lessons`, payload));
  },
  updateLesson(id: string, payload: UpdateLessonPayload) {
    return unwrapResponse(api.patch(`/lessons/${id}`, payload));
  },
  removeLesson(id: string) {
    return unwrapResponse<Record<string, never>>(api.delete(`/lessons/${id}`));
  },
};
