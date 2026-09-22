/** Review state of one item: `n` first-try successes in a row, next review on day `due`. */
export interface ProgressRecord {
  n: number;
  due: number;
}

/** Everything the app remembers about one learner (kept in localStorage, per browser). */
export interface LearnerProgress {
  items: Record<string, ProgressRecord>;
  /** Day on which `newCount` was counted (the daily cap of new items resets when the day changes). */
  newDay: number | null;
  newCount: number;
}

export function emptyProgress(): LearnerProgress {
  return { items: {}, newDay: null, newCount: 0 };
}

/** Item ids are hashes; anything else in stored/imported data is rejected (e.g. "__proto__"). */
export function isItemId(id: string): boolean {
  return /^[0-9a-zA-Z-]{1,64}$/.test(id);
}

/** Days waiting before the next review: 1, 3, 7, 14, then 30 for every further success. */
export const INTERVALS: readonly number[] = [1, 3, 7, 14, 30];

export function nextRecord(rec: ProgressRecord | undefined, firstOk: boolean, day: number): ProgressRecord {
  const n = firstOk ? (rec?.n ?? 0) + 1 : 0;
  const interval = n === 0 ? 1 : INTERVALS[Math.min(n - 1, INTERVALS.length - 1)];
  return { n, due: day + interval };
}

export interface FirstAttempt {
  id: string;
  firstOk: boolean;
  /** The item had never been seen before this session (counts against the daily cap). */
  fresh: boolean;
  day: number;
}

/** Progress after the learner's first attempt at an item in a scheduled session. Pure. */
export function recordFirstAttempt(progress: LearnerProgress, a: FirstAttempt): LearnerProgress {
  const items = { ...progress.items, [a.id]: nextRecord(progress.items[a.id], a.firstOk, a.day) };
  if (!a.fresh) return { ...progress, items };
  const usedToday = progress.newDay === a.day ? progress.newCount : 0;
  return { items, newDay: a.day, newCount: usedToday + 1 };
}

/** Earliest day on which any already-seen item is due again, or null if none was seen yet. */
export function nextReviewDay(items: readonly { id: string }[], progress: LearnerProgress): number | null {
  let next: number | null = null;
  for (const it of items) {
    const rec = progress.items[it.id];
    if (rec && (next === null || rec.due < next)) next = rec.due;
  }
  return next;
}
