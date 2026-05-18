import { api, unwrapResponse } from './api';
import type { LearningPayload } from '../types/learning';

export const learningQueryKeys = {
  detail: (courseId: string) => ['learning', courseId] as const,
};

export const learningApi = {
  detail(courseId: string) {
    return unwrapResponse<LearningPayload>(api.get(`/learning/${courseId}`));
  },
};
