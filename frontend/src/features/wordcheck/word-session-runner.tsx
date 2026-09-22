import { useWordSession } from './use-word-session';
import { WordSessionView } from './word-session-view';
import type { Mode } from './state/types';
import type { Question } from './types';

/**
 * Mounts `useWordSession` for exactly one session. Kept as its own component (instead of
 * calling the hook inline in the page) so React hook rules stay simple: the page only decides
 * *whether* to render this, never conditionally calls the hook itself.
 */
export function WordSessionRunner({
  setId,
  questions,
  name,
  mode,
  pool,
  freshIdx,
  maxRounds,
  onExit,
  onReviewWrong,
  onNextChapter,
  nextSetLabel,
}: {
  setId: string;
  questions: Question[];
  name: string;
  mode: Mode;
  pool: number[];
  freshIdx: number[];
  maxRounds: number;
  onExit: () => void;
  onReviewWrong: (wrongIdx: number[]) => void;
  onNextChapter: (() => void) | null;
  nextSetLabel: string | null;
}) {
  const session = useWordSession({ setId, questions, name, mode, pool, freshIdx, maxRounds });
  return (
    <WordSessionView
      session={session}
      setId={setId}
      questions={questions}
      onExit={onExit}
      onReviewWrong={onReviewWrong}
      onNextChapter={onNextChapter}
      nextSetLabel={nextSetLabel}
    />
  );
}
