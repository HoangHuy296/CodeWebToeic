import { useQuery } from '@tanstack/react-query';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { getApiErrorMessage } from '../../lib/api';
import { formatDateTime } from '../../lib/format';
import { wordCheckApi } from '../../lib/word-check-api';

function formatDurationSeconds(value: number) {
  if (!value) return '0s';
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return minutes ? `${minutes}p ${seconds.toString().padStart(2, '0')}s` : `${seconds}s`;
}

/** "Ket qua kiem tra": the student's own /wordcheck practice history. */
export function StudentWordcheckResultsPage() {
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
        eyebrow="wordcheck scorebook"
        title="Ket qua Kiem tra (/wordcheck) cua ban"
        description="Diem cac lan luyen tap go cum tu o /wordcheck duoc luu tai day khi ban da dang nhap. Neu chua dang nhap luc lam bai, lan lam do se khong xuat hien o day."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.7rem] border border-stroke bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Tong luot lam</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{totalSessions}</p>
        </article>
        <article className="rounded-[1.7rem] border border-stroke bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Ty le dung lan dau</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{avgFirstTryRate}%</p>
        </article>
        <article className="rounded-[1.7rem] border border-stroke bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Lan gan nhat</p>
          <p className="mt-3 text-lg font-extrabold tracking-tight text-slate-950">
            {lastFinishedAt ? formatDateTime(lastFinishedAt) : 'Chua co'}
          </p>
        </article>
      </section>

      {scoresQuery.isPending ? <QueryLoadingState title="Dang tai ket qua..." /> : null}
      {scoresQuery.error ? (
        <QueryErrorState title="Khong tai duoc ket qua" description={getApiErrorMessage(scoresQuery.error)} />
      ) : null}

      {!scoresQuery.isPending && !scoresQuery.error ? (
        <div className="overflow-x-auto rounded-[1.8rem] border border-stroke bg-white/90 shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Bo cau hoi</th>
                <th className="px-4 py-3">Dung lan dau</th>
                <th className="px-4 py-3">So vong</th>
                <th className="px-4 py-3">Tong lan go</th>
                <th className="px-4 py-3">Thoi gian</th>
                <th className="px-4 py-3">Hoan thanh</th>
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
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(score.finishedAt ?? undefined)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {scores.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              Ban chua co luot luyen tap nao o /wordcheck luc da dang nhap.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
