import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { getApiErrorMessage } from '../../lib/api';
import { formatDateTime } from '../../lib/format';
import { wordCheckApi } from '../../lib/word-check-api';

/** "Ket qua kiem tra": the student's own /wordcheck practice history. */
export function StudentWordcheckResultsPage() {
  const { t, i18n } = useTranslation('student');
  const { t: tCommon } = useTranslation('common');
  const dateLocale = i18n.language === 'en' ? 'en-US' : 'vi-VN';

  function formatDurationSeconds(value: number) {
    if (!value) return tCommon('counts.seconds', { count: 0 });
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return minutes
      ? `${tCommon('counts.minutes', { count: minutes })} ${tCommon('counts.seconds', { count: seconds })}`
      : tCommon('counts.seconds', { count: seconds });
  }

  const scoresQuery = useQuery({
    queryKey: ['word-sets', 'my-scores', 'extra'],
    queryFn: () => wordCheckApi.myScores('extra'),
  });

  const scores = scoresQuery.data ?? [];
  const totalSessions = scores.length;
  const avgFirstTryRate = totalSessions
    ? Math.round(
        (scores.reduce((sum, s) => sum + (s.totalInSet ? s.correctFirstTry / s.totalInSet : 0), 0) / totalSessions) *
          100,
      )
    : 0;
  const lastFinishedAt = scores[0]?.finishedAt ?? null;

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow={t('wordcheckResults.eyebrow')}
        title={t('wordcheckResults.title')}
        description={t('wordcheckResults.description')}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.7rem] border border-stroke bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">{t('wordcheckResults.totalSessions')}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{totalSessions}</p>
        </article>
        <article className="rounded-[1.7rem] border border-stroke bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">{t('wordcheckResults.firstTryRate')}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{avgFirstTryRate}%</p>
        </article>
        <article className="rounded-[1.7rem] border border-stroke bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">{t('wordcheckResults.lastSession')}</p>
          <p className="mt-3 text-lg font-extrabold tracking-tight text-slate-950">
            {lastFinishedAt ? formatDateTime(lastFinishedAt, dateLocale) : t('wordcheckResults.noSessionsYet')}
          </p>
        </article>
      </section>

      {scoresQuery.isPending ? <QueryLoadingState title={t('wordcheckResults.loading')} /> : null}
      {scoresQuery.error ? (
        <QueryErrorState title={t('wordcheckResults.loadError')} description={getApiErrorMessage(scoresQuery.error)} />
      ) : null}

      {!scoresQuery.isPending && !scoresQuery.error ? (
        <div className="overflow-x-auto rounded-[1.8rem] border border-stroke bg-white/90 shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-4 py-3">{t('wordcheckResults.questionSet')}</th>
                <th className="px-4 py-3">{t('wordcheckResults.firstTry')}</th>
                <th className="px-4 py-3">{t('wordcheckResults.rounds')}</th>
                <th className="px-4 py-3">{t('wordcheckResults.totalAttempts')}</th>
                <th className="px-4 py-3">{t('wordcheckResults.duration')}</th>
                <th className="px-4 py-3">{t('wordcheckResults.finishedAt')}</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score) => (
                <tr key={score.id} className="border-t border-stroke/70">
                  <td className="px-4 py-3 font-semibold text-slate-900">{score.setName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-xs font-bold',
                        score.correctFirstTry === score.totalInSet
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800',
                      ].join(' ')}
                    >
                      {score.correctFirstTry}/{score.totalInSet}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{score.rounds}</td>
                  <td className="px-4 py-3 text-slate-700">{score.totalAttempts}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDurationSeconds(score.durationSeconds)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(score.finishedAt ?? undefined, dateLocale)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {scores.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">{t('wordcheckResults.emptyLoggedOut')}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
