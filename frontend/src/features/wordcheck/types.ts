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

/** Unlike Question, this carries the English answer — /checkphrase reveals it on purpose. */
export interface Flashcard {
  id: string;
  vi: string;
  en: string;
  note: string;
}

export interface FlashcardsResponse {
  set: SetSummary;
  cards: Flashcard[];
}

export interface DiffWord {
  w: string;
  ok: boolean;
}

export interface WordDiff {
  typed: DiffWord[];
  correct: DiffWord[];
}

/** One finished /wordcheck (or /review) session — shown on the student's own "Ket qua kiem tra" page. */
export interface WordScoreSummary {
  id: string;
  setName: string;
  setSlug: string;
  mode: SessionMode;
  correctFirstTry: number;
  totalAnswered: number;
  totalInSet: number;
  rounds: number;
  totalAttempts: number;
  durationSeconds: number;
  finishedAt: string | null;
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
