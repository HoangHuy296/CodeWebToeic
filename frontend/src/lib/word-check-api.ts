import { api, unwrapResponse } from './api';
import type { GradeResult, QuestionsResponse, SessionInfo, SetSummary } from '../features/wordcheck/types';

export const wordCheckApi = {
  listSets() {
    return unwrapResponse<SetSummary[]>(api.get('/word-sets'));
  },
  questions(setId: string) {
    return unwrapResponse<QuestionsResponse>(api.get(`/word-sets/${encodeURIComponent(setId)}/questions`));
  },
  submitAnswer(setId: string, questionId: string, typed: string, session?: SessionInfo) {
    return unwrapResponse<GradeResult>(
      api.post(`/word-sets/${encodeURIComponent(setId)}/answers`, { questionId, typed, session }),
    );
  },
  finishSession(setId: string, sessionId: string) {
    return unwrapResponse<{ saved: boolean }>(
      api.post(`/word-sets/${encodeURIComponent(setId)}/sessions/${encodeURIComponent(sessionId)}/finish`),
    );
  },
};
