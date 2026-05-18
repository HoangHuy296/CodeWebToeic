import { api, unwrapResponse } from './api';
import type { Enrollment } from '../types/enrollment';

export const enrollmentQueryKeys = {
  mine: ['enrollments', 'mine'] as const,
  byCourse: (courseId: string) => ['enrollments', 'course', courseId] as const,
  learning: (courseId: string) => ['learning', courseId] as const,
};

export const enrollmentApi = {
  enroll(courseId: string) {
    return unwrapResponse<Enrollment>(api.post('/enrollments', { courseId }));
  },
  mine() {
    return unwrapResponse<Enrollment[]>(api.get('/enrollments/me'));
  },
  byCourse(courseId: string) {
    return unwrapResponse<Enrollment[]>(api.get(`/enrollments/course/${courseId}`));
  },
  updateProgress(
    courseId: string,
    payload: {
      lessonId: string;
      watchedSeconds?: number;
      isCompleted?: boolean;
      lastAccessedAt?: string;
    },
  ) {
    return unwrapResponse<Enrollment>(api.patch(`/enrollments/${courseId}/progress`, payload));
  },
};
