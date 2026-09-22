/**
 * Contract with the backend's word-check module (`/api/word-sets/**`). Ported from the
 * standalone toeic-web app's `shared/api.ts`: the browser never receives an answer before it
 * submits — a question only carries the Vietnamese prompt, and grading happens on the server.
 */

export type SessionMode = 'schedule' | 'extra';

export interface SessionInfo {
  id: string;
  name: string;
  mode: SessionMode;
}

export interface SetSummary {
  id: string;
  setName: string;
  itemCount: number;
}

export interface Question {
  /** Stable id; also the key of the learner's review schedule in localStorage. */
  id: string;
  vi: string;
  part: string;
  topic: string;
  /** Non-ASCII characters that legitimately occur in the accepted answers (e.g. "é" for résumé). */
  accents: string;
}

export interface QuestionsResponse {
  set: SetSummary;
  questions: Question[];
}

export interface DiffWord {
  w: string;
  ok: boolean;
}

export interface WordDiff {
  typed: DiffWord[];
  correct: DiffWord[];
}

export interface GradeResult {
  ok: boolean;
  matched: number;
  matchedText: string | null;
  canonical: string;
  diff: WordDiff;
  otherAnswers: string[];
  imeSuspected: boolean;
  example: { en: string; vi: string } | null;
  note: string;
}
