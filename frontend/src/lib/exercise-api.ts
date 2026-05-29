import { api, unwrapResponse } from './api';
import type { ExerciseTopic, ExerciseTopicPayload } from '../types/exercise';

export const exerciseApi = {
  listTopics() {
    return unwrapResponse<ExerciseTopic[]>(api.get('/exercises/topics'));
  },
  detailTopic(slug: string) {
    return unwrapResponse<ExerciseTopic>(api.get(`/exercises/topics/${slug}`));
  },
  createTopic(payload: ExerciseTopicPayload) {
    return unwrapResponse<ExerciseTopic>(api.post('/exercises/topics', payload));
  },
  updateTopic(id: string, payload: ExerciseTopicPayload) {
    return unwrapResponse<ExerciseTopic>(api.patch(`/exercises/topics/${id}`, payload));
  },
  removeTopic(id: string) {
    return unwrapResponse<Record<string, never>>(api.delete(`/exercises/topics/${id}`));
  },
};
