import { api, unwrapResponse } from './api';
import type { MockTest, MockTestSubmissionRecord, MockTestSubmissionResult } from '../types/mock-test';
import type { MockTestPayload } from '../types/mock-test';

export const mockTestApi = {
  list() {
    return unwrapResponse<MockTest[]>(api.get('/mock-tests'));
  },
  listCatalog(params: { kind?: 'mock-test' | 'exercise'; topicSlug?: string; packSlug?: string }) {
    return unwrapResponse<MockTest[]>(api.get('/mock-tests', { params }));
  },
  manageMine() {
    return unwrapResponse<MockTest[]>(api.get('/mock-tests/manage/mine'));
  },
  manageMineCatalog(params: { kind?: 'mock-test' | 'exercise' }) {
    return unwrapResponse<MockTest[]>(api.get('/mock-tests/manage/mine', { params }));
  },
  submissions() {
    return unwrapResponse<MockTestSubmissionRecord[]>(api.get('/mock-tests/submissions'));
  },
  submissionDetail(id: string) {
    return unwrapResponse<MockTestSubmissionResult & {
      student: MockTestSubmissionRecord['student'];
      mockTest: MockTestSubmissionRecord['mockTest'];
      creator: MockTestSubmissionRecord['creator'];
      assignedCourses: MockTestSubmissionRecord['assignedCourses'];
    }>(api.get(`/mock-tests/submissions/${id}`));
  },
  detail(id: string) {
    return unwrapResponse<MockTest>(api.get(`/mock-tests/${id}`));
  },
  submit(
    id: string,
    payload: {
      durationSeconds: number;
      answers: Array<{
        questionId: string;
        selectedOption: string;
      }>;
    },
  ) {
    return unwrapResponse<MockTestSubmissionResult>(api.post(`/mock-tests/${id}/submit`, payload));
  },
  create(payload: MockTestPayload) {
    return unwrapResponse<MockTest>(api.post('/mock-tests', payload));
  },
  update(id: string, payload: Partial<MockTestPayload>) {
    return unwrapResponse<MockTest>(api.patch(`/mock-tests/${id}`, payload));
  },
  remove(id: string) {
    return unwrapResponse<Record<string, never>>(api.delete(`/mock-tests/${id}`));
  },
};
