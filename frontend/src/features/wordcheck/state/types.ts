import type { GradeResult } from '../types';

/** `schedule`: today's plan, updates the review schedule. `extra`: whole set, never touches it. */
export type Mode = 'schedule' | 'extra';

/**
 * answering ──SUBMIT──▶ checking ──GRADED──▶ feedback ──NEXT──▶ answering (next question)
 *     ▲                    │                     ├─NEXT (queue empty)──▶ roundEnd ──REVIEW──▶ answering (next round)
 *     └────GRADE_FAILED────┘                     │                          └─SUBMIT_NOW──▶ finished
 *                                                └─NEXT (nothing wrong / last round)──▶ finished
 *
 * `checking` is the wait for the server, which holds the answers and does the grading.
 * Ported from the standalone toeic-web app's `src/state/machine.ts` (same rules, same shape).
 */
export type Phase = 'answering' | 'checking' | 'feedback' | 'roundEnd' | 'finished';

export interface ItemStats {
  attempts: number;
  /** Outcome of the very first attempt (round 1); null until graded. */
  firstOk: boolean | null;
  ms: number;
  mastered: boolean;
}

export interface Feedback {
  result: GradeResult;
  /** 1-based attempt number for this item in this session. */
  attempt: number;
  /** Wrong on the last allowed attempt: the item stays unmastered. */
  giveUp: boolean;
  typed: string;
}

export interface SessionState {
  phase: Phase;
  name: string;
  mode: Mode;
  day: number;
  maxRounds: number;
  pool: number[];
  total: number;
  freshIdx: number[];
  queue: number[];
  round: number;
  wrong: number[];
  roundTotal: number;
  cur: number;
  mastered: number;
  stats: ItemStats[];
  startedAt: number;
  shownAt: number;
  finishedAt: number | null;
  pending: { typed: string; ms: number } | null;
  feedback: Feedback | null;
}

export type SessionEvent =
  | { type: 'SUBMIT'; typed: string; now: number }
  | { type: 'GRADED'; questionId: string; result: GradeResult }
  | { type: 'GRADE_FAILED'; questionId: string; reason: 'network' | 'stale' }
  | { type: 'NEXT'; now: number }
  | { type: 'REVIEW'; now: number }
  | { type: 'SUBMIT_NOW'; now: number };

export type SessionEffect =
  | { type: 'emptyAnswer' }
  | { type: 'grade'; questionId: string; typed: string }
  | { type: 'gradeFailed'; reason: 'network' | 'stale' }
  | { type: 'firstAttempt'; itemId: string; firstOk: boolean; fresh: boolean }
  | { type: 'finished'; firstOk: number; total: number };

export interface TransitionResult {
  state: SessionState;
  effects: SessionEffect[];
}
