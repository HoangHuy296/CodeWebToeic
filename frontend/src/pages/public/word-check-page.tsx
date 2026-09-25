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
import { PracticeHeader, PracticeSetPicker } from '../../features/wordcheck/practice-layout';

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
      <div className="practice-page">
        <PracticeHeader mode="typing" compact />
        <div className="practice-session">
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
      </div>
    );
  }

  return (
    <div className="practice-page">
      <PracticeHeader mode="typing" />

      <section className="practice-name">
        <label htmlFor="practice-name">{t('common.nameLabel')}</label>
        <input
          id="practice-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('common.namePlaceholder')}
          maxLength={60}
          autoComplete="name"
          aria-describedby="practice-name-hint"
        />
        <p id="practice-name-hint" className="practice-name__hint">{t('layout.nameHint')}</p>
      </section>

      {setsQuery.isPending ? <QueryLoadingState title={t('common.loadingSets')} /> : null}
      {setsQuery.error ? (
        <QueryErrorState title={t('common.loadSetsError')} description={getApiErrorMessage(setsQuery.error)} />
      ) : null}

      <PracticeSetPicker
        sets={setsQuery.data ?? []}
        onSelect={startSet}
        selectedId={presetSetId}
        disabled={!name.trim() || (started && questionsQuery.isFetching)}
      />

      {questionsQuery.isFetching && started ? <QueryLoadingState title={t('common.loadingQuestions')} /> : null}
      {questionsQuery.error ? (
        <QueryErrorState title={t('common.loadQuestionsError')} description={getApiErrorMessage(questionsQuery.error)} />
      ) : null}
    </div>
  );
}
