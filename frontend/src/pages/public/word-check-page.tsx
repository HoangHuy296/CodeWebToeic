import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getApiErrorMessage } from '../../lib/api';
import { wordCheckApi } from '../../lib/word-check-api';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { WORD_CHECK_MAX_ROUNDS } from '../../features/wordcheck/config';
import { WordSessionRunner } from '../../features/wordcheck/word-session-runner';
import { loadLastName, saveLastName } from '../../features/wordcheck/srs/storage';
import { nextSetOf } from '../../features/wordcheck/set-order';

/**
 * "Kiem Tra": type-the-phrase drills over a whole set, no sign-in required. Ported from the
 * standalone toeic-web app's `/starter-1`-style pages — grading always happens on the server.
 */
export function WordCheckPage() {
  const { t } = useTranslation('wordcheck');
  const [searchParams] = useSearchParams();
  const presetSetId = searchParams.get('set');
  const [setId, setSetId] = useState<string | null>(null);
  const [name, setName] = useState(() => loadLastName());
  const [started, setStarted] = useState(false);
  const [pool, setPool] = useState<number[] | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  const setsQuery = useQuery({ queryKey: ['word-sets'], queryFn: wordCheckApi.listSets });
  const questionsQuery = useQuery({
    queryKey: ['word-sets', setId, 'questions'],
    queryFn: () => wordCheckApi.questions(setId!),
    enabled: Boolean(setId),
  });

  function startSet(id: string) {
    saveLastName(name.trim());
    setSetId(id);
    setPool(null);
    setSessionKey((k) => k + 1);
    setStarted(true);
  }

  const nextSet = nextSetOf(setsQuery.data ?? [], setId);

  if (started && setId && questionsQuery.data) {
    const total = questionsQuery.data.questions.length;
    return (
      <div className="space-y-8">
        <PageHeader />
        <WordSessionRunner
          key={`${setId}-${sessionKey}`}
          setId={setId}
          questions={questionsQuery.data.questions}
          name={name.trim() || t('common.guestName')}
          mode="extra"
          pool={pool ?? Array.from({ length: total }, (_, i) => i)}
          freshIdx={[]}
          maxRounds={WORD_CHECK_MAX_ROUNDS}
          onExit={() => {
            setStarted(false);
            setPool(null);
          }}
          onReviewWrong={(wrongIdx) => {
            setPool(wrongIdx);
            setSessionKey((k) => k + 1);
          }}
          onNextChapter={nextSet ? () => startSet(nextSet.id) : null}
          nextSetLabel={nextSet ? nextSet.setName : null}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader />

      <section className="rounded-[2rem] border border-stroke bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] lg:p-8">
        <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{t('common.nameLabel')}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('common.namePlaceholder')}
          maxLength={60}
          className="mt-2 w-full max-w-sm rounded-2xl border border-stroke bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-teal-400"
        />
      </section>

      {setsQuery.isPending ? <QueryLoadingState title={t('common.loadingSets')} /> : null}
      {setsQuery.error ? (
        <QueryErrorState title={t('common.loadSetsError')} description={getApiErrorMessage(setsQuery.error)} />
      ) : null}

      <section className="grid gap-6 sm:grid-cols-2">
        {(setsQuery.data ?? []).map((set) => (
          <div
            key={set.id}
            className={[
              'rounded-[2rem] border bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]',
              set.id === presetSetId ? 'border-teal-400 ring-2 ring-teal-200' : 'border-stroke',
            ].join(' ')}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">{t('common.setLabel')}</p>
            {set.id === presetSetId ? (
              <p className="mt-1 text-xs font-semibold text-teal-600">{t('checkPage.presetHint')}</p>
            ) : null}
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950">{set.setName}</h2>
            <p className="mt-1 text-sm text-slate-600">{t('common.itemCount', { count: set.itemCount })}</p>
            <button
              type="button"
              disabled={!name.trim()}
              onClick={() => startSet(set.id)}
              className="btn-brand mt-5 w-full rounded-full px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('checkPage.practiceWholeSet', { count: set.itemCount })}
            </button>
          </div>
        ))}
      </section>

      {questionsQuery.isFetching && !started ? <QueryLoadingState title={t('common.loadingQuestions')} /> : null}
      {questionsQuery.error ? (
        <QueryErrorState title={t('common.loadQuestionsError')} description={getApiErrorMessage(questionsQuery.error)} />
      ) : null}
    </div>
  );
}

function PageHeader() {
  const { t } = useTranslation('wordcheck');
  return (
    <section className="rounded-[2rem] border border-stroke bg-white px-6 py-8 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-700">{t('checkPage.eyebrow')}</p>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950">{t('checkPage.title')}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">
        {t('checkPage.description')}
      </p>
    </section>
  );
}
