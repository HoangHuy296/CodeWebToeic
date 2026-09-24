import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getApiErrorMessage } from '../../lib/api';
import { wordCheckApi } from '../../lib/word-check-api';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { ttsAvailable, speak } from '../../features/wordcheck/speech';
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
      <div className="space-y-8">
        <PageHeader />
        <FlashcardDeck setId={setId} cards={cardsQuery.data.cards} setName={cardsQuery.data.set.setName} onChangeSet={() => setSetId(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader />

      {setsQuery.isPending ? <QueryLoadingState title={t('common.loadingSets')} /> : null}
      {setsQuery.error ? (
        <QueryErrorState title={t('common.loadSetsError')} description={getApiErrorMessage(setsQuery.error)} />
      ) : null}

      <section className="grid gap-6 sm:grid-cols-2">
        {(setsQuery.data ?? []).map((set) => (
          <div
            key={set.id}
            className="rounded-[2rem] border border-stroke bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">{t('common.setLabel')}</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950">{set.setName}</h2>
            <p className="mt-1 text-sm text-slate-600">{t('common.itemCount', { count: set.itemCount })}</p>
            <button
              type="button"
              onClick={() => setSetId(set.id)}
              className="btn-brand mt-5 w-full rounded-full px-5 py-3 text-sm font-semibold text-white"
            >
              {t('checkPhrase.practiceFlashcards', { count: set.itemCount })}
            </button>
          </div>
        ))}
      </section>

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
      <div className="rounded-[2rem] border border-stroke bg-white p-6 text-sm text-slate-600 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
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
    <div className="rounded-[2rem] border border-stroke bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        <span>{t('checkPhrase.cardCounter', { name: setName, current: idx + 1, total: cards.length })}</span>
        <button type="button" onClick={onChangeSet} className="text-teal-700 normal-case tracking-normal">
          {t('checkPhrase.changeSetShort')}
        </button>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-teal-500 transition-all"
          style={{ width: `${((idx + 1) / cards.length) * 100}%` }}
        />
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label={flipped ? t('checkPhrase.flipToVi') : t('checkPhrase.flipToEn')}
        onClick={flip}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            flip();
          }
        }}
        className="mt-6 cursor-pointer outline-none [perspective:1200px]"
      >
        <div
          className={[
            'relative min-h-[15rem] transition-transform duration-500 [transform-style:preserve-3d]',
            flipped ? '[transform:rotateY(180deg)]' : '',
          ].join(' ')}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[1.6rem] border border-stroke bg-slate-50 p-8 text-center [backface-visibility:hidden]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t('checkPhrase.front')}</p>
            <p className="mt-4 text-2xl font-extrabold leading-snug text-slate-950">{card.vi}</p>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[1.6rem] border border-stroke bg-slate-50 p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t('checkPhrase.back')}</p>
            <p className="mt-4 text-2xl font-extrabold leading-snug text-slate-950">{card.en}</p>
            {ttsAvailable() ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  speak(card.en);
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-teal-500 px-4 py-2 text-sm font-semibold text-teal-700"
              >
                <SpeakerIcon /> {t('checkPhrase.listen')}
              </button>
            ) : null}
            {card.note ? <p className="mt-3 text-sm text-slate-500">{card.note}</p> : null}
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-slate-400">{t('checkPhrase.tapToFlip')}</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={idx === 0}
          className="rounded-full border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← {t('checkPhrase.prev')}
        </button>
        {isLast ? (
          <button type="button" onClick={goToWordcheck} className="btn-brand rounded-full px-5 py-3 text-sm font-semibold text-white">
            {t('checkPhrase.enterTyping')}
          </button>
        ) : (
          <button type="button" onClick={goNext} className="btn-brand rounded-full px-5 py-3 text-sm font-semibold text-white">
            {t('checkPhrase.nextCard')} →
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={goToWordcheck}
        className="mt-3 w-full rounded-full border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-800"
      >
        {t('checkPhrase.skip')}
      </button>
    </div>
  );
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  );
}

function PageHeader() {
  const { t } = useTranslation('wordcheck');
  return (
    <section className="rounded-[2rem] border border-stroke bg-white px-6 py-8 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-700">{t('checkPhrase.eyebrow')}</p>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950">{t('checkPhrase.title')}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">
        {t('checkPhrase.description')}
      </p>
    </section>
  );
}
