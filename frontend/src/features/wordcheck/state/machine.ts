import type { Question } from '../types';
import { summarize } from './selectors';
import type { Mode, SessionEffect, SessionEvent, SessionState, TransitionResult } from './types';

/** Ported from the standalone toeic-web app's `src/state/machine.ts`, unchanged (pure, no I/O). */
export interface MachineEnv {
  questions: readonly Question[];
  shuffle: <T>(arr: readonly T[]) => T[];
}

export interface SessionInit {
  name: string;
  mode: Mode;
  day: number;
  now: number;
  /** Question indices to practise. Must not be empty. */
  pool: readonly number[];
  freshIdx: readonly number[];
  itemCount: number;
  maxRounds: number;
}

/** Start a session with its first question already showing. */
export function createSession(init: SessionInit, env: Pick<MachineEnv, 'shuffle'>): SessionState {
  if (init.pool.length === 0) throw new Error('Cannot start a session with an empty pool');
  return askNext(
    {
      phase: 'answering',
      name: init.name,
      mode: init.mode,
      day: init.day,
      maxRounds: init.maxRounds,
      pool: [...init.pool],
      total: init.pool.length,
      freshIdx: [...init.freshIdx],
      queue: env.shuffle(init.pool),
      round: 1,
      wrong: [],
      roundTotal: init.pool.length,
      cur: -1,
      mastered: 0,
      stats: Array.from({ length: init.itemCount }, () => ({
        attempts: 0,
        firstOk: null,
        ms: 0,
        mastered: false,
      })),
      startedAt: init.now,
      shownAt: init.now,
      finishedAt: null,
      pending: null,
      feedback: null,
    },
    init.now,
  );
}

const unchanged = (state: SessionState): TransitionResult => ({ state, effects: [] });

/** Apply one event. Events that are not valid in the current phase are ignored (no change). */
export function transition(state: SessionState, event: SessionEvent, env: MachineEnv): TransitionResult {
  switch (event.type) {
    case 'SUBMIT':
      return state.phase === 'answering' ? submit(state, event, env) : unchanged(state);

    case 'GRADED':
      return isAwaiting(state, event.questionId, env) ? graded(state, event, env) : unchanged(state);

    case 'GRADE_FAILED':
      return isAwaiting(state, event.questionId, env)
        ? {
            state: { ...state, phase: 'answering', pending: null },
            effects: [{ type: 'gradeFailed', reason: event.reason }],
          }
        : unchanged(state);

    case 'NEXT':
      if (state.phase !== 'feedback') return unchanged(state);
      return state.queue.length > 0 ? { state: askNext(state, event.now), effects: [] } : endRound(state, event.now);

    case 'REVIEW': {
      if (state.phase !== 'roundEnd' || state.wrong.length === 0) return unchanged(state);
      const queue = env.shuffle(state.wrong);
      const next = askNext({ ...state, round: state.round + 1, queue, wrong: [], roundTotal: queue.length }, event.now);
      return { state: next, effects: [] };
    }

    case 'SUBMIT_NOW':
      return state.phase === 'roundEnd' ? finish(state, event.now) : unchanged(state);
  }
}

function isAwaiting(state: SessionState, questionId: string, env: MachineEnv): boolean {
  return state.phase === 'checking' && env.questions[state.cur]?.id === questionId;
}

function askNext(state: SessionState, now: number): SessionState {
  const [cur, ...queue] = state.queue;
  if (cur === undefined) throw new Error('askNext called with an empty queue');
  return { ...state, phase: 'answering', cur, queue, shownAt: now, pending: null, feedback: null };
}

function submit(state: SessionState, event: Extract<SessionEvent, { type: 'SUBMIT' }>, env: MachineEnv): TransitionResult {
  if (!event.typed.trim()) return { state, effects: [{ type: 'emptyAnswer' }] };
  const question = env.questions[state.cur];
  if (!question) throw new Error(`No question at index ${state.cur}`);

  return {
    state: {
      ...state,
      phase: 'checking',
      pending: { typed: event.typed, ms: event.now - state.shownAt },
    },
    effects: [{ type: 'grade', questionId: question.id, typed: event.typed }],
  };
}

function graded(state: SessionState, event: Extract<SessionEvent, { type: 'GRADED' }>, env: MachineEnv): TransitionResult {
  const question = env.questions[state.cur];
  const prev = state.stats[state.cur];
  const pending = state.pending;
  if (!question || !prev || !pending) throw new Error('graded() called without a pending answer');

  const { result } = event;
  const attempts = prev.attempts + 1;
  const firstOk = attempts === 1 ? result.ok : prev.firstOk;
  const stats = state.stats.slice();
  stats[state.cur] = {
    attempts,
    firstOk,
    ms: prev.ms + pending.ms,
    mastered: prev.mastered || result.ok,
  };

  const effects: SessionEffect[] = [];
  if (attempts === 1 && state.mode === 'schedule') {
    effects.push({
      type: 'firstAttempt',
      itemId: question.id,
      firstOk: result.ok,
      fresh: state.freshIdx.includes(state.cur),
    });
  }

  return {
    state: {
      ...state,
      phase: 'feedback',
      stats,
      mastered: state.mastered + (result.ok ? 1 : 0),
      wrong: result.ok ? state.wrong : [...state.wrong, state.cur],
      pending: null,
      feedback: {
        result,
        attempt: attempts,
        giveUp: !result.ok && attempts >= state.maxRounds,
        typed: pending.typed,
      },
    },
    effects,
  };
}

function endRound(state: SessionState, now: number): TransitionResult {
  if (state.wrong.length === 0 || state.round >= state.maxRounds) return finish(state, now);
  return { state: { ...state, phase: 'roundEnd', feedback: null }, effects: [] };
}

function finish(state: SessionState, now: number): TransitionResult {
  const done: SessionState = { ...state, phase: 'finished', finishedAt: now, feedback: null };
  const { firstOk, total } = summarize(done);
  return { state: done, effects: [{ type: 'finished', firstOk, total }] };
}
