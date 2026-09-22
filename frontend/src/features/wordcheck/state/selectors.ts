import type { SessionState } from './types';

/** Ported from the standalone toeic-web app's `src/state/selectors.ts`, unchanged. */
export interface ResultRow {
  n: number;
  firstOk: boolean;
  attempts: number;
  mastered: boolean;
  ms: number;
}

export interface Summary {
  firstOk: number;
  total: number;
  attempts: number;
  rounds: number;
  elapsedMs: number;
  rows: ResultRow[];
}

export function summarize(state: SessionState): Summary {
  const rows: ResultRow[] = state.pool.map((idx, k) => {
    const s = state.stats[idx];
    return { n: k + 1, firstOk: s.firstOk === true, attempts: s.attempts, mastered: s.mastered, ms: s.ms };
  });
  return {
    firstOk: rows.filter((r) => r.firstOk).length,
    total: state.total,
    attempts: rows.reduce((sum, r) => sum + r.attempts, 0),
    rounds: state.round,
    elapsedMs: (state.finishedAt ?? state.startedAt) - state.startedAt,
    rows,
  };
}

export function nextButtonLabel(state: SessionState): string {
  if (state.queue.length > 0) return 'Tiep tuc';
  return state.wrong.length === 0 || state.round >= state.maxRounds ? 'Nop va nhan ket qua' : `Ket thuc vong ${state.round}`;
}

export function questionsLeftInRound(state: SessionState): number {
  return state.queue.length + 1;
}
