import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { getApiErrorMessage } from '../../lib/api';
import { courseApi } from '../../lib/course-api';
import { mockTestApi } from '../../lib/mock-test-api';
import type { MockTest, MockTestPayload, MockTestQuestion } from '../../types/mock-test';

interface WorkspaceMockTestEditorPageProps {
  workspaceRole: 'admin' | 'teacher';
  mode: 'create' | 'edit';
}

function createQuestionDraft(order: number): MockTestPayload['questions'][number] {
  return {
    section: 'mixed',
    prompt: '',
    explanation: '',
    options: [
      { key: 'A', text: '', isCorrect: true },
      { key: 'B', text: '', isCorrect: false },
      { key: 'C', text: '', isCorrect: false },
      { key: 'D', text: '', isCorrect: false },
    ],
    correctAnswer: 'A',
    points: 1,
    order,
    level: 'medium',
  };
}

function createMockTestDraft(): MockTestPayload {
  return {
    catalogKind: 'mock-test',
    title: '',
    description: '',
    type: 'mini-test',
    level: 'beginner',
    durationMinutes: 30,
    status: 'draft',
    instructions: [],
    isFeatured: false,
    assignedCourseIds: [],
    questions: [createQuestionDraft(1)],
  };
}

function mapQuestion(question: MockTestQuestion, index: number): MockTestPayload['questions'][number] {
  return {
    section: question.section,
    prompt: question.prompt,
    explanation: question.explanation,
    correctAnswer: question.correctAnswer ?? question.options.find((option) => option.isCorrect)?.key ?? 'A',
    options: question.options.map((option) => ({
      key: option.key,
      text: option.text,
      isCorrect: option.key === (question.correctAnswer ?? question.options.find((candidate) => candidate.isCorrect)?.key),
    })),
    audioUrl: question.audioUrl,
    imageUrl: question.imageUrl,
    points: question.points,
    order: question.order || index + 1,
    level: question.level,
  };
}

function mapMockTestToDraft(mockTest: MockTest): MockTestPayload {
  return {
    catalogKind: 'mock-test',
    title: mockTest.title,
    description: mockTest.description,
    type: mockTest.type,
    level: mockTest.level,
    durationMinutes: mockTest.durationMinutes,
    status: mockTest.status,
    instructions: mockTest.instructions,
    isFeatured: mockTest.isFeatured,
    assignedCourseIds: mockTest.assignedCourseIds,
    questions: (mockTest.questions ?? []).map(mapQuestion),
  };
}

export function WorkspaceMockTestEditorPage({ workspaceRole, mode }: WorkspaceMockTestEditorPageProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [draft, setDraft] = useState<MockTestPayload>(createMockTestDraft());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const detailQuery = useQuery({
    queryKey: [workspaceRole, 'mock-test', 'detail', slug],
    queryFn: () => mockTestApi.detail(slug!),
    enabled: mode === 'edit' && Boolean(slug),
  });
  const courseOptionsQuery = useQuery({
    queryKey: [workspaceRole, 'mock-test-course-options'],
    queryFn: courseApi.manageMine,
  });

  useEffect(() => {
    if (mode === 'create') {
      setDraft(createMockTestDraft());
      setCurrentQuestionIndex(0);
      return;
    }

    if (detailQuery.data) {
      setDraft(mapMockTestToDraft(detailQuery.data));
      setCurrentQuestionIndex(0);
    }
  }, [detailQuery.data, mode]);

  const saveMutation = useMutation({
    mutationFn: () => (mode === 'edit' && slug ? mockTestApi.update(slug, draft) : mockTestApi.create(draft)),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [workspaceRole, 'mock-tests'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'mock-tests'] }),
        queryClient.invalidateQueries({ queryKey: ['mock-tests'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ]);

      navigate(`/${workspaceRole}/mock-tests/${result.id}`, { replace: true });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (mockTestId: string) => mockTestApi.remove(mockTestId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [workspaceRole, 'mock-tests'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'mock-tests'] }),
        queryClient.invalidateQueries({ queryKey: ['mock-tests'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ]);

      navigate(`/${workspaceRole}/mock-tests`, { replace: true });
    },
  });

  const availableCourses = courseOptionsQuery.data ?? [];
  const selectedCourseCount = draft.assignedCourseIds?.length ?? 0;
  const currentQuestion = draft.questions[currentQuestionIndex] ?? null;
  const instructionsText = useMemo(() => (draft.instructions ?? []).join('\n'), [draft.instructions]);
  const canSubmit =
    Boolean(draft.title.trim()) &&
    Boolean(draft.description.trim()) &&
    draft.durationMinutes > 0 &&
    draft.questions.length > 0 &&
    draft.questions.every(
      (question) =>
        question.prompt.trim() &&
        question.options.every((option) => option.text.trim()) &&
        question.correctAnswer.trim(),
    );

  const pageTitle =
    workspaceRole === 'admin'
      ? mode === 'create'
        ? 'Admin tao bai thi moi trong full-screen builder.'
        : 'Admin cap nhat bai thi trong full-screen builder.'
      : mode === 'create'
        ? 'Teacher tao mock-test rieng cho hoc vien cua minh.'
        : 'Teacher cap nhat mock-test rieng cho hoc vien cua minh.';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.92),rgba(15,23,42,1)_45%),linear-gradient(180deg,#020617,#111827)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.38)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">{workspaceRole} mock test workspace</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white">{pageTitle}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Khung nay duoc thiet ke theo phong cach full-screen de viec tao va chinh sua cau hoi khong bi tran layout,
                tap trung vao cau hoi hien tai giong flow lam bai cua student.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to={`/${workspaceRole}/mock-tests`} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
                Ve danh sach de thi
              </Link>
              {mode === 'edit' && slug ? (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Xoa bai thi nay?')) {
                      deleteMutation.mutate(slug);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="rounded-full border border-rose-300/20 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-100 disabled:opacity-60"
                >
                  {deleteMutation.isPending ? 'Dang xoa...' : 'Xoa bai thi'}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !canSubmit}
                className="rounded-full bg-[linear-gradient(135deg,#22c55e,#0f766e)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saveMutation.isPending ? 'Dang luu...' : mode === 'edit' ? 'Luu cap nhat' : 'Tao bai thi moi'}
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <article className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Loai bai thi</p>
              <p className="mt-2 text-lg font-black tracking-tight text-white">{draft.type}</p>
            </article>
            <article className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Level</p>
              <p className="mt-2 text-lg font-black tracking-tight text-white">{draft.level}</p>
            </article>
            <article className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">So cau hoi</p>
              <p className="mt-2 text-lg font-black tracking-tight text-white">{draft.questions.length}</p>
            </article>
            <article className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Assigned courses</p>
              <p className="mt-2 text-lg font-black tracking-tight text-white">{selectedCourseCount}</p>
            </article>
          </div>
        </header>

        {mode === 'edit' && detailQuery.isPending ? <QueryLoadingState title="Dang tai chi tiet bai thi..." /> : null}
        {courseOptionsQuery.isPending ? <QueryLoadingState title="Dang tai course options..." /> : null}
        {detailQuery.error ? <QueryErrorState title="Khong tai duoc chi tiet bai thi" description={getApiErrorMessage(detailQuery.error)} /> : null}
        {courseOptionsQuery.error ? <QueryErrorState title="Khong tai duoc danh sach khoa hoc" description={getApiErrorMessage(courseOptionsQuery.error)} /> : null}
        {saveMutation.error ? <QueryErrorState title="Khong luu duoc bai thi" description={getApiErrorMessage(saveMutation.error)} /> : null}
        {deleteMutation.error ? <QueryErrorState title="Khong xoa duoc bai thi" description={getApiErrorMessage(deleteMutation.error)} /> : null}

        <section className="grid gap-6 xl:grid-cols-[0.34fr_0.66fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_18px_55px_rgba(2,6,23,0.3)] backdrop-blur">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Cau hinh va navigator</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-white">Mock test outline</h2>
            </div>

            <div className="mt-5 grid gap-3">
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Tieu de bai thi"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={draft.type}
                  onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as MockTestPayload['type'] }))}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                >
                  <option value="mini-test">Mini test</option>
                  <option value="full-test">Full test</option>
                  <option value="practice-set">Practice set</option>
                </select>
                <select
                  value={draft.level}
                  onChange={(event) => setDraft((current) => ({ ...current, level: event.target.value as MockTestPayload['level'] }))}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="1"
                  value={draft.durationMinutes}
                  onChange={(event) => setDraft((current) => ({ ...current, durationMinutes: Number(event.target.value) || 0 }))}
                  placeholder="So phut"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300"
                />
                <select
                  value={draft.status}
                  onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as NonNullable<MockTestPayload['status']> }))}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200">
                <input
                  type="checkbox"
                  checked={draft.isFeatured ?? false}
                  onChange={(event) => setDraft((current) => ({ ...current, isFeatured: event.target.checked }))}
                  className="size-4"
                />
                Featured tren public landing
              </label>
            </div>

            <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-slate-950/35 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Assigned courses</p>
              <div className="mt-3 grid gap-2">
                {availableCourses.map((course) => {
                  const checked = (draft.assignedCourseIds ?? []).includes(course.id);
                  return (
                    <label key={course.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            assignedCourseIds: event.target.checked
                              ? [...(current.assignedCourseIds ?? []), course.id]
                              : (current.assignedCourseIds ?? []).filter((courseId) => courseId !== course.id),
                          }))
                        }
                        className="mt-1 size-4"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{course.title}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                          {course.category} · {course.level}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
              <p className="mt-3 text-xs leading-6 text-slate-400">
                {workspaceRole === 'admin'
                  ? 'De trong danh sach nay rong va publish bai thi de bien thanh bai thi mien phi cho tat ca hoc vien.'
                  : 'Teacher chi gan bai thi vao khoa hoc cua minh. Student phai enroll course duoc gan moi thay de thi.'}
              </p>
            </div>

            <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-slate-950/35 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Question navigator</p>
                <button
                  type="button"
                  onClick={() => {
                    setDraft((current) => ({
                      ...current,
                      questions: [...current.questions, createQuestionDraft(current.questions.length + 1)],
                    }));
                    setCurrentQuestionIndex(draft.questions.length);
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400 text-slate-950"
                >
                  +
                </button>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {draft.questions.map((question, index) => (
                  <button
                    key={`question-nav-${index}`}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={[
                      'rounded-2xl px-3 py-3 text-sm font-semibold transition',
                      index === currentQuestionIndex
                        ? 'bg-cyan-400 text-slate-950'
                        : question.prompt.trim()
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : 'bg-white/8 text-slate-300 hover:bg-white/12',
                    ].join(' ')}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_55px_rgba(2,6,23,0.3)] backdrop-blur">
            <div className="grid gap-5">
              <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Mo ta bai thi</p>
                <textarea
                  rows={4}
                  value={draft.description}
                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Mo ta bai thi"
                  className="mt-4 w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-slate-400 focus:border-cyan-300"
                />
              </article>

              <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Huong dan lam bai</p>
                <textarea
                  rows={4}
                  value={instructionsText}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      instructions: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean),
                    }))
                  }
                  placeholder="Moi dong la 1 huong dan lam bai"
                  className="mt-4 w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-slate-400 focus:border-cyan-300"
                />
              </article>

              {currentQuestion ? (
                <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 px-5 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Question {currentQuestionIndex + 1}</p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Question body editor</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (draft.questions.length > 1) {
                          setDraft((current) => ({
                            ...current,
                            questions: current.questions
                              .filter((_, index) => index !== currentQuestionIndex)
                              .map((item, itemIndex) => ({ ...item, order: itemIndex + 1 })),
                          }));
                          setCurrentQuestionIndex((current) => Math.max(0, current - 1));
                        }
                      }}
                      className="rounded-full border border-rose-300/20 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-100"
                    >
                      Xoa cau hoi
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-4">
                    <select
                      value={currentQuestion.section}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          questions: current.questions.map((item, index) =>
                            index === currentQuestionIndex ? { ...item, section: event.target.value as typeof item.section } : item,
                          ),
                        }))
                      }
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                    >
                      <option value="mixed">Mixed</option>
                      <option value="listening">Listening</option>
                      <option value="reading">Reading</option>
                      <option value="speaking">Speaking</option>
                      <option value="writing">Writing</option>
                    </select>
                    <select
                      value={currentQuestion.level}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          questions: current.questions.map((item, index) =>
                            index === currentQuestionIndex ? { ...item, level: event.target.value as typeof item.level } : item,
                          ),
                        }))
                      }
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={currentQuestion.points}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          questions: current.questions.map((item, index) =>
                            index === currentQuestionIndex ? { ...item, points: Number(event.target.value) || 1 } : item,
                          ),
                        }))
                      }
                      placeholder="Points"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300"
                    />
                    <input
                      type="number"
                      min="1"
                      value={currentQuestion.order}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          questions: current.questions.map((item, index) =>
                            index === currentQuestionIndex ? { ...item, order: Number(event.target.value) || item.order } : item,
                          ),
                        }))
                      }
                      placeholder="Order"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300"
                    />
                  </div>

                  <textarea
                    rows={4}
                    value={currentQuestion.prompt}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        questions: current.questions.map((item, index) =>
                          index === currentQuestionIndex ? { ...item, prompt: event.target.value } : item,
                        ),
                      }))
                    }
                    placeholder="Prompt cau hoi"
                    className="mt-4 w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-slate-400 focus:border-cyan-300"
                  />

                  <textarea
                    rows={3}
                    value={currentQuestion.explanation ?? ''}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        questions: current.questions.map((item, index) =>
                          index === currentQuestionIndex ? { ...item, explanation: event.target.value } : item,
                        ),
                      }))
                    }
                    placeholder="Explanation sau khi cham bai"
                    className="mt-4 w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-slate-400 focus:border-cyan-300"
                  />

                  <div className="mt-4 grid gap-3">
                    {currentQuestion.options.map((option, optionIndex) => (
                      <label key={`${option.key}-${optionIndex}`} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <input
                          type="radio"
                          name={`correct-answer-${currentQuestionIndex}`}
                          checked={currentQuestion.correctAnswer === option.key}
                          onChange={() =>
                            setDraft((current) => ({
                              ...current,
                              questions: current.questions.map((item, index) =>
                                index === currentQuestionIndex
                                  ? {
                                      ...item,
                                      correctAnswer: option.key,
                                      options: item.options.map((candidate) => ({
                                        ...candidate,
                                        isCorrect: candidate.key === option.key,
                                      })),
                                    }
                                  : item,
                              ),
                            }))
                          }
                          className="size-4"
                        />
                        <span className="w-8 text-sm font-black text-cyan-200">{option.key}</span>
                        <input
                          value={option.text}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              questions: current.questions.map((item, index) =>
                                index === currentQuestionIndex
                                  ? {
                                      ...item,
                                      options: item.options.map((candidate, candidateIndex) =>
                                        candidateIndex === optionIndex ? { ...candidate, text: event.target.value } : candidate,
                                      ),
                                    }
                                  : item,
                              ),
                            }))
                          }
                          placeholder={`Noi dung dap an ${option.key}`}
                          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-white outline-none placeholder:text-slate-400 focus:border-cyan-300"
                        />
                      </label>
                    ))}
                  </div>
                </article>
              ) : null}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
