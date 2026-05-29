import { api, unwrapResponse } from './api';
import type { MockTest, MockTestPayload, MockTestSubmissionRecord, MockTestSubmissionResult } from '../types/mock-test';

export const exerciseSessionApi = {
  list(params?: { topicSlug?: string }) {
    return unwrapResponse<MockTest[]>(api.get('/exercises/items', { params }));
  },
  manageMine() {
    return unwrapResponse<MockTest[]>(api.get('/exercises/items/manage/mine'));
  },
  detail(id: string) {
    return unwrapResponse<MockTest>(api.get(`/exercises/items/${id}`));
  },
  submit(
    id: string,
    payload: {
      durationSeconds?: number;
      answers: Array<{
        questionId: string;
        selectedOption: string;
      }>;
    },
  ) {
    return unwrapResponse<MockTestSubmissionResult>(api.post(`/exercises/items/${id}/submit`, payload));
  },
  create(payload: MockTestPayload) {
    return unwrapResponse<MockTest>(api.post('/exercises/items', { ...payload, catalogKind: 'exercise' }));
  },
  update(id: string, payload: Partial<MockTestPayload>) {
    return unwrapResponse<MockTest>(api.patch(`/exercises/items/${id}`, { ...payload, catalogKind: 'exercise' }));
  },
  remove(id: string) {
    return unwrapResponse<Record<string, never>>(api.delete(`/exercises/items/${id}`));
  },
  submissions() {
    return unwrapResponse<MockTestSubmissionRecord[]>(api.get('/exercises/submissions'));
  },
  submissionDetail(id: string) {
    return unwrapResponse<
      MockTestSubmissionResult & {
        student: MockTestSubmissionRecord['student'];
        mockTest: MockTestSubmissionRecord['mockTest'];
        creator: MockTestSubmissionRecord['creator'];
        assignedCourses: MockTestSubmissionRecord['assignedCourses'];
      }
    >(api.get(`/exercises/submissions/${id}`));
  },
};
