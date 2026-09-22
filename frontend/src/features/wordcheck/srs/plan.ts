import type { LearnerProgress } from './progress';

export interface SessionPlan {
  /** Indices of items due for review today. */
  due: number[];
  /** Indices of never-seen items to introduce today (limited by the daily cap). */
  fresh: number[];
  nextDue: number | null;
  /** New items that did not fit under today's cap. */
  waitingNew: number;
}

export function planSession(
  items: readonly { id: string }[],
  progress: LearnerProgress,
  day: number,
  maxNew: number,
): SessionPlan {
  const due: number[] = [];
  const fresh: number[] = [];
  let nextDue: number | null = null;

  items.forEach((it, i) => {
    const rec = progress.items[it.id];
    if (!rec) fresh.push(i);
    else if (rec.due <= day) due.push(i);
    else if (nextDue === null || rec.due < nextDue) nextDue = rec.due;
  });

  const usedToday = progress.newDay === day ? progress.newCount : 0;
  const room = Math.max(0, maxNew - usedToday);
  const take = fresh.slice(0, room);
  if (fresh.length > take.length && (nextDue === null || nextDue > day + 1)) nextDue = day + 1;

  return { due, fresh: take, nextDue, waitingNew: fresh.length - take.length };
}
