import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getApiErrorMessage } from '../../lib/api';
import { wordCheckApi } from '../../lib/word-check-api';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { ttsAvailable, speak } from '../../features/wordcheck/speech';
import { ArrowIcon, PracticeHeader, PracticeSetPicker } from '../../features/wordcheck/practice-layout';
import type { Flashcard } from '../../features/wordcheck/types';

/**
 * "Cum Tu": a flashcard warm-up shown before typing practice. Ported from the standalone
 * toeic-web app's flashcard step — flip to reveal the English phrase, optionally hear it via
 * the browser's built-in text-to-speech (no audio files to store or serve). Either finishing
 * the deck or skipping it hands off to /wordcheck, where the student types their name and the
 * graded typing drill begins; this page never grades anything itself.
 */
export function CheckPhrasePage() {
  const { t } = useTranslation('wordcheck');
  const [setId, setSetId] = useState<string | null>(null);

  const setsQuery = useQuery({ queryKey: ['word-sets'], queryFn: wordCheckApi.listSets });
  const cardsQuery = useQuery({
    queryKey: ['word-sets', setId, 'flashcards'],
    queryFn: () => wordCheckApi.flashcards(setId!),
    enabled: Boolean(setId),
  });

  if (setId && cardsQuery.data) {
    return (
      <div className="practice-page">
        <PracticeHeader mode="flashcards" compact />
        <FlashcardDeck setId={setId} cards={cardsQuery.data.cards} setName={cardsQuery.data.set.setName} onChangeSet={() => setSetId(null)} />
      </div>
    );
  }

  return (
    <div className="practice-page">
      <PracticeHeader mode="flashcards" />

      {setsQuery.isPending ? <QueryLoadingState title={t('common.loadingSets')} /> : null}
      {setsQuery.error ? (
        <QueryErrorState title={t('common.loadSetsError')} description={getApiErrorMessage(setsQuery.error)} />
      ) : null}

      <PracticeSetPicker sets={setsQuery.data ?? []} onSelect={setSetId} disabled={Boolean(setId) && cardsQuery.isFetching} />

      {setId && cardsQuery.isPending ? <QueryLoadingState title={t('checkPhrase.loadingFlashcards')} /> : null}
      {cardsQuery.error ? (
        <QueryErrorState title={t('checkPhrase.loadFlashcardsError')} description={getApiErrorMessage(cardsQuery.error)} />
      ) : null}
    </div>
  );
}

function FlashcardDeck({
  setId,
  setName,
  cards,
  onChangeSet,
}: {
  setId: string;
  setName: string;
  cards: Flashcard[];
  onChangeSet: () => void;
}) {
  const { t } = useTranslation('wordcheck');
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="flashcard-deck text-sm text-slate-600">
        {t('checkPhrase.emptySet')}
        <button type="button" onClick={onChangeSet} className="ml-2 font-semibold text-teal-700">
          {t('checkPhrase.changeSet')}
        </button>
      </div>
    );
  }

  const card = cards[idx];
  const isLast = idx === cards.length - 1;

  function goToWordcheck() {
    navigate(`/wordcheck?set=${encodeURIComponent(setId)}`);
  }

  function flip() {
    setFlipped((value) => !value);
  }

  function goPrev() {
    if (idx === 0) return;
    setIdx((value) => value - 1);
    setFlipped(false);
  }

  function goNext() {
    if (isLast) return;
    setIdx((value) => value + 1);
    setFlipped(false);
  }

  return (
    <section className="flashcard-deck" aria-label={setName}>
      <div className="flashcard-deck__heading">
        <h2>{setName}</h2>
        <span className="flashcard-deck__count" aria-live="polite" aria-atomic="true" aria-label={t('checkPhrase.cardCounter', { name: setName, current: idx + 1, total: cards.length })}>
          {String(idx + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}
        </span>
      </div>

      <div className="flashcard-deck__track" aria-hidden="true">
        <div className="flashcard-deck__progress" style={{ width: `${((idx + 1) / cards.length) * 100}%` }} />
      </div>

      <button
        type="button"
        className="flashcard"
        aria-pressed={flipped}
        aria-label={flipped ? t('checkPhrase.flipToVi') : t('checkPhrase.flipToEn')}
        aria-describedby={flipped ? 'flashcard-en' : 'flashcard-vi'}
        onClick={flip}
      >
        <span className="flashcard__body">
          <span className="flashcard__face" aria-hidden={flipped}>
            <span className="flashcard__language">{t('checkPhrase.front')}</span>
            <span id="flashcard-vi" className="flashcard__phrase" lang="vi">{card.vi}</span>
          </span>
          <span className="flashcard__face flashcard__face--back" aria-hidden={!flipped}>
            <span className="flashcard__language">{t('checkPhrase.back')}</span>
            <span id="flashcard-en" className="flashcard__phrase" lang="en">{card.en}</span>
            {card.note ? <span className="flashcard__note">{card.note}</span> : null}
          </span>
        </span>
      </button>

      <div className="flashcard-deck__tools">
        <span className="flashcard-deck__hint"><FlipIcon /> {t('checkPhrase.tapToFlip')}</span>
        {ttsAvailable() ? (
          <button type="button" disabled={!flipped} onClick={() => speak(card.en)} className="flashcard-deck__listen">
            <SpeakerIcon /> {t('checkPhrase.listen')}
          </button>
        ) : null}
      </div>

      <div className="flashcard-deck__navigation">
        <button
          type="button"
          onClick={goPrev}
          disabled={idx === 0}
          className="btn-secondary"
        >
          <ArrowIcon previous /> {t('checkPhrase.prev')}
        </button>
        {isLast ? (
          <button type="button" onClick={goToWordcheck} className="btn-brand">
            {t('layout.typing')} <ArrowIcon />
          </button>
        ) : (
          <button type="button" onClick={goNext} className="btn-brand">
            {t('checkPhrase.nextCard')} <ArrowIcon />
          </button>
        )}
      </div>

      <div className="flashcard-deck__footer">
        <button type="button" onClick={onChangeSet} className="practice-text-link">
          <ArrowIcon previous /> {t('checkPhrase.changeSetShort')}
        </button>
        {!isLast ? <button type="button" onClick={goToWordcheck} className="practice-text-link">{t('layout.typing')} <ArrowIcon /></button> : null}
      </div>
    </section>
  );
}

function SpeakerIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  );
}

function FlipIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10a8 8 0 0 1 14-5l2 2M20 3v4h-4M20 14a8 8 0 0 1-14 5l-2-2M4 21v-4h4" />
    </svg>
  );
}
