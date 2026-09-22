import { useCallback, useMemo, useRef, useState } from 'react';
import { wordCheckApi } from '../../lib/word-check-api';
import { createSession, transition, type MachineEnv } from './state/machine';
import type { Mode, SessionEvent, SessionState } from './state/types';
import { dayIndex } from './srs/day';
import { recordFirstAttempt } from './srs/progress';
import { loadProgress, saveProgress } from './srs/storage';
import { createSessionId } from './session-id';
import type { Question, SessionInfo } from './types';

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface UseWordSessionArgs {
  setId: string;
  questions: Question[];
  name: string;
  mode: Mode;
  pool: number[];
  freshIdx: number[];
  maxRounds: number;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'failed';

/**
 * Runs one practice session: wires the pure state machine (ported from the standalone
 * toeic-web app) to the server (grading, finishing) and to localStorage (the review schedule).
 * The browser never scores itself: it submits a typed answer and the server says right/wrong.
 *
 * `dispatch` reads/writes a ref (not a `setState` updater) so each event runs `transition` and
 * its effects (API calls, localStorage writes) exactly once — a `setState` updater can run
 * twice under React 18 StrictMode, which would double-submit the grade/finish requests.
 */
export function useWordSession({ setId, questions, name, mode, pool, freshIdx, maxRounds }: UseWordSessionArgs) {
  const sessionIdRef = useRef(createSessionId());
  const env = useMemo<MachineEnv>(() => ({ questions, shuffle }), [questions]);
  const initialState = useMemo(
    () =>
      createSession(
        { name, mode, day: dayIndex(), now: Date.now(), pool, freshIdx, itemCount: questions.length, maxRounds },
        { shuffle },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- session is created once per mount
    [],
  );
  const stateRef = useRef(initialState);
  const [state, setState] = useState<SessionState>(initialState);
  const [message, setMessage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const dispatch = useCallback(
    (event: SessionEvent) => {
      const result = transition(stateRef.current, event, env);
      stateRef.current = result.state;
      setState(result.state);

      for (const effect of result.effects) {
        if (effect.type === 'emptyAnswer') {
          setMessage('Hay go cau tra loi truoc khi nop.');
        } else if (effect.type === 'gradeFailed') {
          setMessage(
            effect.reason === 'network'
              ? 'Khong ket noi duoc may chu. Hay kiem tra mang roi bam nop lai.'
              : 'Bo cau hoi vua duoc cap nhat. Hay tai lai trang de tiep tuc.',
          );
        } else if (effect.type === 'grade') {
          setMessage(null);
          const sessionInfo: SessionInfo = { id: sessionIdRef.current, name, mode };
          wordCheckApi
            .submitAnswer(setId, effect.questionId, effect.typed, sessionInfo)
            .then((result2) => dispatch({ type: 'GRADED', questionId: effect.questionId, result: result2 }))
            .catch(() => dispatch({ type: 'GRADE_FAILED', questionId: effect.questionId, reason: 'network' }));
        } else if (effect.type === 'firstAttempt') {
          const progress = loadProgress(name, setId);
          const next = recordFirstAttempt(progress, {
            id: effect.itemId,
            firstOk: effect.firstOk,
            fresh: effect.fresh,
            day: dayIndex(),
          });
          saveProgress(name, setId, next);
        } else if (effect.type === 'finished') {
          setSaveStatus('saving');
          wordCheckApi
            .finishSession(setId, sessionIdRef.current)
            .then(() => setSaveStatus('saved'))
            .catch(() => setSaveStatus('failed'));
        }
      }
    },
    [env, name, mode, setId],
  );

  const submit = useCallback((typed: string) => dispatch({ type: 'SUBMIT', typed, now: Date.now() }), [dispatch]);
  const next = useCallback(() => dispatch({ type: 'NEXT', now: Date.now() }), [dispatch]);
  const review = useCallback(() => dispatch({ type: 'REVIEW', now: Date.now() }), [dispatch]);
  const submitNow = useCallback(() => dispatch({ type: 'SUBMIT_NOW', now: Date.now() }), [dispatch]);

  const retrySave = useCallback(() => {
    setSaveStatus('saving');
    wordCheckApi
      .finishSession(setId, sessionIdRef.current)
      .then(() => setSaveStatus('saved'))
      .catch(() => setSaveStatus('failed'));
  }, [setId]);

  return { state, message, saveStatus, submit, next, review, submitNow, retrySave };
}
