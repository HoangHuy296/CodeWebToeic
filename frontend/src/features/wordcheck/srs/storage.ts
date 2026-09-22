import { emptyProgress, isItemId, type LearnerProgress } from './progress';

const KEY_PREFIX = 'wordcheck_srs_v1::';
const NAME_KEY = 'wordcheck_name';

function keyFor(name: string): string {
  return KEY_PREFIX + name.trim().toLowerCase();
}

/** Reads one learner's review schedule for one set from `localStorage`. Never throws. */
export function loadProgress(name: string, setId: string): LearnerProgress {
  try {
    const raw = window.localStorage.getItem(keyFor(name) + '::' + setId);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<LearnerProgress>;
    const items: LearnerProgress['items'] = {};
    if (parsed.items && typeof parsed.items === 'object') {
      for (const [id, rec] of Object.entries(parsed.items)) {
        if (isItemId(id) && rec && typeof rec.n === 'number' && typeof rec.due === 'number') {
          items[id] = { n: rec.n, due: rec.due };
        }
      }
    }
    return {
      items,
      newDay: typeof parsed.newDay === 'number' ? parsed.newDay : null,
      newCount: typeof parsed.newCount === 'number' ? parsed.newCount : 0,
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(name: string, setId: string, progress: LearnerProgress): void {
  try {
    window.localStorage.setItem(keyFor(name) + '::' + setId, JSON.stringify(progress));
  } catch {
    // Browser storage may be unavailable (private mode, quota); the session still works.
  }
}

export function loadLastName(): string {
  try {
    return window.localStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveLastName(name: string): void {
  try {
    window.localStorage.setItem(NAME_KEY, name);
  } catch {
    // ignore
  }
}
