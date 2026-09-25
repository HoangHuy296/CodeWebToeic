import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../lib/admin-api';
import { formatDateTime } from '../../lib/format';
import { getApiErrorMessage } from '../../lib/api';
import { QueryErrorState, QueryLoadingState } from '../common/query-state';

/**
 * Shared by /admin/resultswordcheck (mode="extra") and the "On tap" tab of /admin/results
 * (mode="schedule") — both read the same `word_scores` table, split by practice mode.
 */
export function WordScoreResultsTable({ mode }: { mode: 'extra' | 'schedule' }) {
  const { t, i18n } = useTranslation('admin');
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

  const [search, setSearch] = useState('');

  const scoresQuery = useQuery({
    queryKey: ['admin', 'word-scores', mode],
    queryFn: () => adminApi.wordScores(mode),
  });

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (scoresQuery.data ?? []).filter((score) => {
      if (!keyword) return true;
      return [score.studentName, score.setName, score.studentId ?? '']
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    });
  }, [scoresQuery.data, search]);

  const totalSessions = filtered.length;
  const avgFirstTryRate = totalSessions
    ? Math.round(
        (filtered.reduce((sum, score) => sum + (score.totalInSet ? score.correctFirstTry / score.totalInSet : 0), 0) /
          totalSessions) *
          100,
      )
    : 0;
  const uniqueStudents = new Set(filtered.map((score) => score.studentName.trim().toLowerCase())).size;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.7rem] border border-stroke bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">{t('wordScoreResults.totalSessions')}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{totalSessions}</p>
        </article>
        <article className="rounded-[1.7rem] border border-stroke bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">{t('wordScoreResults.firstTryRate')}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{avgFirstTryRate}%</p>
        </article>
        <article className="rounded-[1.7rem] border border-stroke bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">{t('wordScoreResults.uniqueStudents')}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{uniqueStudents}</p>
        </article>
      </section>

      <section className="rounded-[1.8rem] border border-stroke bg-white/90 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">{t('wordScoreResults.searchLabel')}</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('wordScoreResults.searchPlaceholder')}
            className="h-12 max-w-md rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none focus:border-teal-500"
          />
        </label>
      </section>

      {scoresQuery.isPending ? <QueryLoadingState title={t('wordScoreResults.loading')} /> : null}
      {scoresQuery.error ? (
        <QueryErrorState title={t('wordScoreResults.loadError')} description={getApiErrorMessage(scoresQuery.error)} />
      ) : null}

      {!scoresQuery.isPending && !scoresQuery.error ? (
        <div className="overflow-x-auto rounded-[1.8rem] border border-stroke bg-white/90 shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-4 py-3">{t('wordScoreResults.student')}</th>
                <th className="px-4 py-3">{t('wordScoreResults.questionSet')}</th>
                <th className="px-4 py-3">{t('wordScoreResults.firstTry')}</th>
                <th className="px-4 py-3">{t('wordScoreResults.rounds')}</th>
                <th className="px-4 py-3">{t('wordScoreResults.totalAttempts')}</th>
                <th className="px-4 py-3">{t('wordScoreResults.duration')}</th>
                <th className="px-4 py-3">{t('wordScoreResults.finishedAt')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((score) => (
                <tr key={score.id} className="border-t border-stroke/70">
                  <td className="px-4 py-3 font-semibold text-slate-900">{score.studentName}</td>
                  <td className="px-4 py-3 text-slate-700">{score.setName}</td>
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

          {filtered.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">{t('wordScoreResults.empty')}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
