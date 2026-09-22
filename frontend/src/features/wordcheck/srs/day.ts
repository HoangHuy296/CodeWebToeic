const MS_PER_DAY = 86_400_000;

/** Whole days since 1970-01-01 in the learner's local time zone. */
export function dayIndex(now: Date = new Date()): number {
  return Math.floor((now.getTime() - now.getTimezoneOffset() * 60_000) / MS_PER_DAY);
}

export function dayToDate(day: number, now: Date = new Date()): Date {
  return new Date(day * MS_PER_DAY + now.getTimezoneOffset() * 60_000);
}
