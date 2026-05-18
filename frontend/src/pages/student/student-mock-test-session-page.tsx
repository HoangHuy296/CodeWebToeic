import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/providers/auth-provider';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { getApiErrorMessage } from '../../lib/api';
import { mockTestApi } from '../../lib/mock-test-api';
import type { MockTestSubmissionResult } from '../../types/mock-test';

function formatCountdown(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function StudentMockTestSessionPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { role } = useAuth();
  const id = params.id ?? params.slug ?? '';
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);
  const [result, setResult] = useState<MockTestSubmissionResult | null>(null);
  const hasStartedRef = useRef(false);
  const hasAutoSubmittedRef = useRef(false);

  const mockTestQuery = useQuery({
    queryKey: ['student', 'mock-test-session', id],
    enabled: Boolean(id),
    queryFn: () => mockTestApi.detail(id),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: {
      durationSeconds: number;
      answers: Array<{ questionId: string; selectedOption: string }>;
    }) => mockTestApi.submit(id, payload),
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const questions = mockTestQuery.data?.questions ?? [];
  const totalDurationSeconds = (mockTestQuery.data?.durationMinutes ?? 0) * 60;
  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const answeredCount = useMemo(
    () => Object.values(selectedAnswers).filter((value) => value.trim().length > 0).length,
    [selectedAnswers],
  );
  const backPath = role === 'teacher' ? '/mock-test' : searchParams.get('from') === 'public' ? '/mock-test' : '/student/mock-tests';
  const workspaceEyebrow = role === 'teacher' ? 'teacher mock test preview' : 'student mock test session';

  useEffect(() => {
    if (!mockTestQuery.data || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    setTimeLeftSeconds(totalDurationSeconds);
  }, [mockTestQuery.data, totalDurationSeconds]);

  useEffect(() => {
    if (result || submitMutation.isPending || timeLeftSeconds === null) {
      return;
    }

    if (timeLeftSeconds <= 0 && !hasAutoSubmittedRef.current) {
      hasAutoSubmittedRef.current = true;
      submitMutation.mutate({
        durationSeconds: totalDurationSeconds,
        answers: Object.entries(selectedAnswers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })),
      });
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeftSeconds((current) => (current === null ? current : Math.max(0, current - 1)));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [result, selectedAnswers, submitMutation, timeLeftSeconds, totalDurationSeconds]);

  const handleSubmit = () => {
    if (submitMutation.isPending || result) {
      return;
    }

    const durationSeconds =
      timeLeftSeconds === null ? 0 : Math.max(0, totalDurationSeconds - timeLeftSeconds);

    submitMutation.mutate({
      durationSeconds,
      answers: Object.entries(selectedAnswers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      })),
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.92),rgba(15,23,42,1)_45%),linear-gradient(180deg,#020617,#111827)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.38)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">{workspaceEyebrow}</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
                {mockTestQuery.data?.title ?? 'Dang tai bai thi...'}
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Khong gian lam bai duoc tach khoi workspace de giu de bai, lua chon va timer gon hon cho nguoi dung.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-[1.4rem] border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100">Thoi gian con lai</p>
                <p className="mt-1 text-2xl font-black tracking-tight text-amber-300">
                  {formatCountdown(timeLeftSeconds ?? totalDurationSeconds)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitMutation.isPending || Boolean(result)}
                className="rounded-full bg-[linear-gradient(135deg,#22c55e,#0f766e)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitMutation.isPending ? 'Dang nop bai...' : result ? 'Da nop bai' : 'Nop bai'}
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <article className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Loai bai thi</p>
              <p className="mt-2 text-lg font-black tracking-tight text-white">{mockTestQuery.data?.type ?? '--'}</p>
            </article>
            <article className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Level</p>
              <p className="mt-2 text-lg font-black tracking-tight text-white">{mockTestQuery.data?.level ?? '--'}</p>
            </article>
            <article className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">So cau da lam</p>
              <p className="mt-2 text-lg font-black tracking-tight text-white">
                {answeredCount}/{questions.length}
              </p>
            </article>
            <article className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">So cau hien co</p>
              <p className="mt-2 text-lg font-black tracking-tight text-white">{questions.length}</p>
            </article>
          </div>
        </header>

        {mockTestQuery.isPending ? <QueryLoadingState title="Dang tai bai thi..." /> : null}
        {mockTestQuery.error ? (
          <QueryErrorState title="Khong tai duoc bai thi" description={getApiErrorMessage(mockTestQuery.error)} />
        ) : null}

        {submitMutation.error ? (
          <QueryErrorState title="Khong nop duoc bai thi" description={getApiErrorMessage(submitMutation.error)} />
        ) : null}

        {mockTestQuery.data ? (
          <main className="grid gap-6 xl:grid-cols-[0.34fr_0.66fr]">
            <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_18px_55px_rgba(2,6,23,0.3)] backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">question navigator</p>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-white">Danh sach cau hoi</h2>
              </div>

              <div className="mt-5 grid grid-cols-5 gap-2">
                {questions.map((question, index) => {
                  const selectedOption = selectedAnswers[question.id];
                  const isActive = index === currentQuestionIndex;

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={[
                        'rounded-2xl px-3 py-3 text-sm font-semibold transition',
                        isActive
                          ? 'bg-cyan-400 text-slate-950'
                          : selectedOption
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : 'bg-white/8 text-slate-300 hover:bg-white/12',
                      ].join(' ')}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-slate-950/35 px-4 py-4 text-sm leading-7 text-slate-300">
                <p className="font-semibold text-white">Huong dan</p>
                <ul className="mt-2 space-y-1">
                  {(mockTestQuery.data.instructions ?? []).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((current) => Math.max(0, current - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                >
                  Cau truoc
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((current) => Math.min(questions.length - 1, current + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                >
                  Cau tiep
                </button>
              </div>
            </aside>

            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_55px_rgba(2,6,23,0.3)] backdrop-blur">
              {result ? (
                <div className="space-y-5">
                  <div className="rounded-[1.6rem] border border-emerald-300/20 bg-emerald-500/10 px-5 py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">Ket qua bai thi</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-white">{result.score} diem</h2>
                    <p className="mt-2 text-sm text-emerald-100">
                      Dung {result.correctAnswers}/{result.totalQuestions} cau. Thoi gian lam bai: {formatCountdown(result.durationSeconds)}.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {result.review.map((item, index) => (
                      <article
                        key={item.questionId}
                        className={[
                          'rounded-[1.5rem] border px-5 py-5',
                          item.isCorrect
                            ? 'border-emerald-300/20 bg-emerald-500/10'
                            : 'border-rose-300/20 bg-rose-500/10',
                        ].join(' ')}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Cau {index + 1}</p>
                            <h3 className="mt-2 text-lg font-black tracking-tight text-white">{item.prompt}</h3>
                          </div>
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                            {item.isCorrect ? 'Dung' : 'Sai'}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-2xl bg-black/15 px-4 py-4 text-sm text-slate-200">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Ban chon</p>
                            <p className="mt-2 font-semibold">{item.selectedOption || 'Chua tra loi'}</p>
                          </div>
                          <div className="rounded-2xl bg-black/15 px-4 py-4 text-sm text-slate-200">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Dap an dung</p>
                            <p className="mt-2 font-semibold">{item.correctAnswer}</p>
                          </div>
                        </div>
                        {item.explanation ? (
                          <p className="mt-4 text-sm leading-7 text-slate-200">{item.explanation}</p>
                        ) : null}
                      </article>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={backPath}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Ve danh sach bai thi
                    </Link>
                    <button
                      type="button"
                      onClick={() => navigate(0)}
                      className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
                    >
                      Lam lai bai thi
                    </button>
                  </div>
                </div>
              ) : currentQuestion ? (
                <div className="space-y-5">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 px-5 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                        Cau {currentQuestionIndex + 1} / {questions.length}
                      </p>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                        {currentQuestion.section}
                      </span>
                    </div>
                    <h2 className="mt-3 text-2xl font-black tracking-tight text-white">{currentQuestion.prompt}</h2>
                  </div>

                  <div className="grid gap-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = selectedAnswers[currentQuestion.id] === option.key;

                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() =>
                            setSelectedAnswers((current) => ({
                              ...current,
                              [currentQuestion.id]: option.key,
                            }))
                          }
                          className={[
                            'rounded-[1.4rem] border px-5 py-4 text-left transition',
                            isSelected
                              ? 'border-cyan-300 bg-cyan-400/15 text-white'
                              : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/8',
                          ].join(' ')}
                        >
                          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">{option.key}</span>
                          <p className="mt-2 text-base leading-7">{option.text}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 px-5 py-8 text-sm text-slate-300">
                  Bai thi nay chua co cau hoi de hien thi.
                </div>
              )}
            </section>
          </main>
        ) : null}
      </div>
    </div>
  );
}
