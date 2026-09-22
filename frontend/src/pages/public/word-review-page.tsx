import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApiErrorMessage } from '../../lib/api';
import { wordCheckApi } from '../../lib/word-check-api';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { WORD_CHECK_MAX_NEW_PER_DAY, WORD_CHECK_MAX_ROUNDS } from '../../features/wordcheck/config';
import { WordSessionRunner } from '../../features/wordcheck/word-session-runner';
import { loadLastName, loadProgress, saveLastName } from '../../features/wordcheck/srs/storage';
import { dayIndex, dayToDate } from '../../features/wordcheck/srs/day';
import { planSession } from '../../features/wordcheck/srs/plan';
import { nextSetOf } from '../../features/wordcheck/set-order';

/**
 * "On Tap": spaced review (Leitner) over items already due today, plus a small batch of new
 * items. The schedule lives in this browser's `localStorage`, keyed by learner name + set.
 */
export function WordReviewPage() {
  const [setId, setSetId] = useState<string | null>(null);
  const [name, setName] = useState(() => loadLastName());
  const [started, setStarted] = useState(false);
  const [reviewPool, setReviewPool] = useState<number[] | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  const setsQuery = useQuery({ queryKey: ['word-sets'], queryFn: wordCheckApi.listSets });
  const questionsQuery = useQuery({
    queryKey: ['word-sets', setId, 'questions'],
    queryFn: () => wordCheckApi.questions(setId!),
    enabled: Boolean(setId),
  });

  const trimmedName = name.trim();
  const today = dayIndex();
  const plan = useMemo(() => {
    if (!setId || !trimmedName || !questionsQuery.data) return null;
    const progress = loadProgress(trimmedName, setId);
    return planSession(questionsQuery.data.questions, progress, today, WORD_CHECK_MAX_NEW_PER_DAY);
  }, [setId, trimmedName, questionsQuery.data, today]);

  const nextSet = nextSetOf(setsQuery.data ?? [], setId);

  if (started && setId && questionsQuery.data && (reviewPool || plan)) {
    const pool = reviewPool ?? [...plan!.due, ...plan!.fresh];
    const freshIdx = reviewPool ? [] : plan!.fresh;
    return (
      <div className="space-y-8">
        <PageHeader />
        <WordSessionRunner
          key={`${setId}-${sessionKey}`}
          setId={setId}
          questions={questionsQuery.data.questions}
          name={trimmedName}
          mode="schedule"
          pool={pool}
          freshIdx={freshIdx}
          maxRounds={WORD_CHECK_MAX_ROUNDS}
          onExit={() => {
            setStarted(false);
            setReviewPool(null);
          }}
          onReviewWrong={(wrongIdx) => {
            setReviewPool(wrongIdx);
            setSessionKey((k) => k + 1);
          }}
          onNextChapter={
            nextSet
              ? () => {
                  saveLastName(trimmedName);
                  setSetId(nextSet.id);
                  setReviewPool(null);
                  setSessionKey((k) => k + 1);
                }
              : null
          }
          nextSetLabel={nextSet ? nextSet.setName : null}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader />

      <section className="rounded-[2rem] border border-stroke bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] lg:p-8">
        <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Ten cua ban</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhap ten de xem lich on hom nay..."
          maxLength={60}
          className="mt-2 w-full max-w-sm rounded-2xl border border-stroke bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-teal-400"
        />
      </section>

      {setsQuery.isPending ? <QueryLoadingState title="Dang tai danh sach bo..." /> : null}
      {setsQuery.error ? (
        <QueryErrorState title="Khong tai duoc danh sach bo" description={getApiErrorMessage(setsQuery.error)} />
      ) : null}

      <section className="grid gap-6 sm:grid-cols-2">
        {(setsQuery.data ?? []).map((set) => {
          const isSelected = setId === set.id;
          const currentPlan = isSelected ? plan : null;
          return (
            <div key={set.id} className="rounded-[2rem] border border-stroke bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Bo cau hoi</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">{set.setName}</h2>
              <p className="mt-1 text-sm text-slate-600">{set.itemCount} cum tu</p>

              {!trimmedName ? (
                <p className="mt-4 text-sm text-slate-500">Nhap ten o tren de xem lich on hom nay.</p>
              ) : !isSelected || questionsQuery.isPending ? (
                <button
                  type="button"
                  onClick={() => setSetId(set.id)}
                  className="mt-4 rounded-full border border-stroke bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Xem lich on
                </button>
              ) : currentPlan ? (
                <div className="mt-4 space-y-3">
                  {currentPlan.due.length + currentPlan.fresh.length > 0 ? (
                    <p className="text-sm text-slate-700">
                      Hom nay: {currentPlan.due.length + currentPlan.fresh.length} cum ({currentPlan.due.length} on lai,{' '}
                      {currentPlan.fresh.length} cum moi).
                    </p>
                  ) : (
                    <p className="text-sm text-slate-700">Hom nay ban da on xong.</p>
                  )}
                  {currentPlan.nextDue !== null && currentPlan.nextDue > today ? (
                    <p className="text-xs text-slate-500">Lan on tiep theo: {formatDate(currentPlan.nextDue)}.</p>
                  ) : null}
                  <button
                    type="button"
                    disabled={currentPlan.due.length + currentPlan.fresh.length === 0}
                    onClick={() => {
                      saveLastName(trimmedName);
                      setReviewPool(null);
                      setSessionKey((k) => k + 1);
                      setStarted(true);
                    }}
                    className="btn-brand w-full rounded-full px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {currentPlan.due.length + currentPlan.fresh.length > 0
                      ? `Bat dau on hom nay (${currentPlan.due.length + currentPlan.fresh.length} cum)`
                      : 'Bat dau on hom nay'}
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </section>

      {questionsQuery.error ? (
        <QueryErrorState title="Khong tai duoc cau hoi" description={getApiErrorMessage(questionsQuery.error)} />
      ) : null}
    </div>
  );
}

function formatDate(day: number): string {
  return dayToDate(day).toLocaleDateString('vi-VN');
}

function PageHeader() {
  return (
    <section className="rounded-[2rem] border border-stroke bg-white px-6 py-8 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-700">on tap</p>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950">Lich on cach quang</h1>
      <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">
        Cum tu duoc on lai dung luc sap quen (1, 3, 7, 14, 30 ngay). Lich on nay luu trong trinh duyet nay; doi may hay
        xoa du lieu trinh duyet se mat, hay on deu de khong bi don lai qua nhieu.
      </p>
    </section>
  );
}
