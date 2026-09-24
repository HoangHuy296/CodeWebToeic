import { api, unwrapResponse } from './api';
import type {
  FlashcardsResponse,
  GradeResult,
  QuestionsResponse,
  SessionInfo,
  SetSummary,
  WordScoreSummary,
} from '../features/wordcheck/types';

export const wordCheckApi = {
  listSets() {
    return unwrapResponse<SetSummary[]>(api.get('/word-sets'));
  },
  questions(setId: string) {
    return unwrapResponse<QuestionsResponse>(api.get(`/word-sets/${encodeURIComponent(setId)}/questions`));
  },
  flashcards(setId: string) {
    return unwrapResponse<FlashcardsResponse>(api.get(`/word-sets/${encodeURIComponent(setId)}/flashcards`));
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
  /** Requires the caller to be logged in — the current user's own /wordcheck or /review history. */
  myScores(mode: 'extra' | 'schedule' = 'extra') {
    return unwrapResponse<WordScoreSummary[]>(api.get('/word-sets/my-scores', { params: { mode } }));
  },
};
