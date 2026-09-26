import type { SetSummary } from './types';

export interface CourseGroup {
  courseSlug: string;
  courseName: string;
  sets: SetSummary[];
}

/** The backend already returns sets in curriculum order; this only folds them into their courses. */
export function groupSetsByCourse(sets: readonly SetSummary[]): CourseGroup[] {
  const groups: CourseGroup[] = [];
  for (const set of sets) {
    const courseSlug = set.courseSlug ?? '';
    let group = groups.find((candidate) => candidate.courseSlug === courseSlug);
    if (!group) {
      group = { courseSlug, courseName: set.courseName ?? '', sets: [] };
      groups.push(group);
    }
    group.sets.push(set);
  }
  return groups;
}

/** Winner's ETS banks are full sentences; every other course drills short phrases. */
export function itemUnitKey(set: Pick<SetSummary, 'courseSlug'>): 'itemCount' | 'sentenceCount' {
  return set.courseSlug === 'toeic-winner' ? 'sentenceCount' : 'itemCount';
}

/** The chapter after `currentId` inside the same course, so "next" never jumps into another course. */
export function nextSetOf(sets: readonly SetSummary[], currentId: string | null): SetSummary | null {
  if (!currentId) return null;
  const index = sets.findIndex((set) => set.id === currentId);
  if (index < 0) return null;
  const next = sets[index + 1];
  return next && (next.courseSlug ?? '') === (sets[index].courseSlug ?? '') ? next : null;
}
