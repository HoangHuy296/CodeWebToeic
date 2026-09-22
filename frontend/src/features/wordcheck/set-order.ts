import type { SetSummary } from './types';

/** Curriculum sets are slugged "starter-N"; this recovers N so pages can offer "next chapter". */
function setNumber(id: string): number | null {
  const match = /^starter-(\d+)$/.exec(id);
  return match ? Number(match[1]) : null;
}

export function nextSetOf(sets: readonly SetSummary[], currentId: string | null): SetSummary | null {
  if (!currentId) return null;
  const currentNum = setNumber(currentId);
  if (currentNum === null) return null;
  return sets.find((set) => setNumber(set.id) === currentNum + 1) ?? null;
}
