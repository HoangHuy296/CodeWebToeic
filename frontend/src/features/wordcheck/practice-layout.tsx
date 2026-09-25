import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { SetSummary } from './types';
import './practice-layout.css';

export function PracticeHeader({ mode, compact = false }: { mode: 'flashcards' | 'typing'; compact?: boolean }) {
  const { t } = useTranslation('wordcheck');
  const flashcards = mode === 'flashcards';

  return (
    <header className="practice-header">
      <div className="practice-header__copy">
        <span className="practice-header__icon" aria-hidden="true"><PracticeIcon /></span>
        <div className="min-w-0">
          <h1>{flashcards ? t('checkPhrase.title') : t('checkPage.title')}</h1>
          {!compact ? <p>{flashcards ? t('checkPhrase.description') : t('checkPage.description')}</p> : null}
        </div>
      </div>
      {!compact ? (
        <Link to={flashcards ? '/wordcheck' : '/checkphrase'} className="practice-text-link">
          {flashcards ? t('layout.typing') : t('layout.flashcards')} <ArrowIcon />
        </Link>
      ) : null}
    </header>
  );
}

export function PracticeSetPicker({
  sets, onSelect, disabled = false, selectedId,
}: {
  sets: SetSummary[];
  onSelect: (id: string) => void;
  disabled?: boolean;
  selectedId?: string | null;
}) {
  const { t } = useTranslation('wordcheck');

  return (
    <section aria-label={t('common.setLabel')} className="practice-set-grid">
      {sets.map((set, index) => (
        <button
          key={set.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(set.id)}
          className="practice-set"
          data-selected={set.id === selectedId || undefined}
          aria-label={t('layout.openSet', { name: set.setName })}
        >
          <span className="practice-set__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <span className="min-w-0 flex-1">
            <span className="practice-set__name">{set.setName}</span>
            <span className="practice-set__count">{t('common.itemCount', { count: set.itemCount })}</span>
            {set.id === selectedId ? <span className="practice-set__hint">{t('checkPage.presetHint')}</span> : null}
          </span>
          <span className="practice-set__arrow" aria-hidden="true"><ArrowIcon /></span>
        </button>
      ))}
    </section>
  );
}

function PracticeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="5" width="13" height="15" rx="2" />
      <path d="M16 5V3H5a2 2 0 0 0-2 2v11h4M11 10h5M11 14h3" />
    </svg>
  );
}

export function ArrowIcon({ previous = false }: { previous?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {previous ? <path d="M19 12H5m6 6-6-6 6-6" /> : <path d="M5 12h14m-6-6 6 6-6 6" />}
    </svg>
  );
}
