import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../app/providers/auth-provider';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { courseApi, type CreateLessonPayload, type UpdateLessonPayload } from '../../lib/course-api';
import { getApiErrorMessage } from '../../lib/api';
import { formatDurationMinutes } from '../../lib/media';
import type { CourseLesson } from '../../types/course';

interface LessonEditorDraft {
  title: string;
  description: string;
  order: string;
  isPreview: boolean;
  videoUrl: string;
  duration: string;
  thumbnail: string;
}

type SortMode = 'order-asc' | 'order-desc' | 'title-asc';
type PanelMode = 'detail' | 'create' | 'edit';

function createLessonDraft(lesson?: CourseLesson): LessonEditorDraft {
  return {
    title: lesson?.title ?? '',
    description: lesson?.description ?? '',
    order: typeof lesson?.order === 'number' ? String(lesson.order) : '',
    isPreview: lesson?.isPreview ?? false,
    videoUrl: lesson?.video.videoUrl ?? '',
    duration: typeof lesson?.video.duration === 'number' ? String(lesson.video.duration) : '',
    thumbnail: lesson?.video.thumbnail ?? '',
  };
}

function buildLessonPayload(draft: LessonEditorDraft): CreateLessonPayload {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    order: Number(draft.order),
    isPreview: draft.isPreview,
    video: {
      videoUrl: draft.videoUrl.trim(),
      videoProvider: 'youtube',
      duration: draft.duration.trim() ? Number(draft.duration) : undefined,
      thumbnail: draft.thumbnail.trim() || undefined,
    },
  };
}

function buildLessonUpdatePayload(draft: LessonEditorDraft): UpdateLessonPayload {
  return buildLessonPayload(draft);
}

function sortLessons(lessons: CourseLesson[], sortMode: SortMode) {
  return [...lessons].sort((left, right) => {
    if (sortMode === 'order-desc') {
      return right.order - left.order;
    }

    if (sortMode === 'title-asc') {
      return left.title.localeCompare(right.title);
    }

    return left.order - right.order;
  });
}

export function CourseLessonsManagePage() {
  const { slug = '' } = useParams();
  const { role, user } = useAuth();
  const queryClient = useQueryClient();
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('order-asc');
  const [panelMode, setPanelMode] = useState<PanelMode>('detail');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [createDraft, setCreateDraft] = useState<LessonEditorDraft>(createLessonDraft());
  const [editDraft, setEditDraft] = useState<LessonEditorDraft>(createLessonDraft());

  const courseQuery = useQuery({
    queryKey: ['courses', 'detail', slug, 'lesson-manage'],
    enabled: Boolean(slug),
    queryFn: () => courseApi.detail(slug),
  });

  const course = courseQuery.data;
  const canManageCourse = course
    ? role === 'admin' || (role === 'teacher' && user?.id === course.owner.id)
    : false;
  const workspaceBasePath = role === 'admin' ? '/admin/courses' : '/teacher/courses';

  const lessons = course?.lessons ?? [];
  const filteredLessons = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();
    const base = normalizedKeyword
      ? lessons.filter((lesson) =>
          [lesson.title, lesson.description, lesson.slug].join(' ').toLowerCase().includes(normalizedKeyword),
        )
      : lessons;

    return sortLessons(base, sortMode);
  }, [lessons, searchKeyword, sortMode]);

  const selectedLesson =
    filteredLessons.find((lesson) => lesson.id === selectedLessonId) ??
    lessons.find((lesson) => lesson.id === selectedLessonId) ??
    filteredLessons[0] ??
    null;

  useEffect(() => {
    if (panelMode === 'create') {
      return;
    }

    if (selectedLesson) {
      setSelectedLessonId(selectedLesson.id);
      return;
    }

    if (filteredLessons.length > 0) {
      setSelectedLessonId(filteredLessons[0].id);
    }
  }, [filteredLessons, panelMode, selectedLesson]);

  useEffect(() => {
    if (panelMode === 'edit' && selectedLesson) {
      setEditDraft(createLessonDraft(selectedLesson));
    }
  }, [panelMode, selectedLesson]);

  const invalidateLessons = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['courses'] }),
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', slug] }),
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', slug, 'lesson-manage'] }),
      queryClient.invalidateQueries({ queryKey: ['teacher', 'courses', 'mine'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] }),
    ]);
  };

  const createLessonMutation = useMutation({
    mutationFn: (payload: CreateLessonPayload) => courseApi.createLesson(course!.id, payload),
    onSuccess: async (createdLesson) => {
      setSystemMessage('Da them lesson moi vao khoa hoc.');
      setCreateDraft(createLessonDraft());
      setPanelMode('detail');
      setSelectedLessonId(String((createdLesson as { id?: string }).id ?? ''));
      await invalidateLessons();
    },
    onError: (error) => {
      setSystemMessage(getApiErrorMessage(error));
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ lessonId, payload }: { lessonId: string; payload: UpdateLessonPayload }) =>
      courseApi.updateLesson(lessonId, payload),
    onSuccess: async (_data, variables) => {
      setSystemMessage('Cap nhat lesson thanh cong.');
      setPanelMode('detail');
      setSelectedLessonId(variables.lessonId);
      await invalidateLessons();
    },
    onError: (error) => {
      setSystemMessage(getApiErrorMessage(error));
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => courseApi.removeLesson(lessonId),
    onSuccess: async () => {
      setSystemMessage('Da xoa lesson khoi khoa hoc.');
      setPanelMode('detail');
      setSelectedLessonId(null);
      await invalidateLessons();
    },
    onError: (error) => {
      setSystemMessage(getApiErrorMessage(error));
    },
  });

  const summary = useMemo(() => {
    if (!course) {
      return [];
    }

    return [
      { label: 'Tong lessons', value: String(course.lessonCount) },
      { label: 'Tong thoi luong', value: formatDurationMinutes(course.totalDuration) },
      { label: 'Review status', value: course.reviewStatus },
    ];
  }, [course]);

  useEffect(() => {
    document.title = course ? `Lesson List | ${course.title}` : 'Lesson List';
    return () => {
      document.title = 'IVYTS 1997';
    };
  }, [course]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.12),transparent_40%),linear-gradient(180deg,#f8fafc,#eef2ff)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-violet-700">lesson list workspace</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
                {course?.title ?? 'Dang tai khoa hoc...'}
              </h1>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                Workspace rieng cho teacher/admin quan ly bai giang o tab moi, giup mo rong bai hoc, bai tap va media
                ma khong can day het CRUD vao mot trang chi tiet.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={workspaceBasePath}
                className="rounded-full border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Ve danh sach khoa hoc
              </Link>
              {course ? (
                <Link
                  to={`/courses/${course.slug}`}
                  className="btn-brand rounded-full px-5 py-3 text-sm font-semibold text-white"
                >
                  Ve chi tiet khoa hoc
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {summary.map((item) => (
              <article key={item.label} className="rounded-[1.4rem] border border-stroke bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-xl font-black tracking-tight text-slate-950">{item.value}</p>
              </article>
            ))}
          </div>
        </header>

        {courseQuery.isPending ? <QueryLoadingState title="Dang tai lesson workspace..." /> : null}
        {courseQuery.error ? (
          <QueryErrorState title="Khong tai duoc khoa hoc" description={getApiErrorMessage(courseQuery.error)} />
        ) : null}

        {course && !canManageCourse ? (
          <QueryErrorState
            title="Khong co quyen quan ly lesson"
            description="Teacher chi duoc mo workspace nay voi khoa hoc do minh so huu. Admin co quyen voi moi khoa hoc."
          />
        ) : null}

        {course && canManageCourse ? (
          <>
            <main className="grid items-start gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <section className="rounded-[2rem] border border-stroke bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-700">search and sort lesson</p>
                    <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Lesson list</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPanelMode('create');
                      setSystemMessage(null);
                      setCreateDraft(createLessonDraft());
                    }}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 text-2xl font-black text-violet-700 transition hover:bg-violet-100"
                    aria-label="Create lesson"
                  >
                    +
                  </button>
                </div>

                <div className="mt-5 grid gap-3">
                  <input
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                    placeholder="Tim theo tieu de, mo ta, slug..."
                    className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                  />
                  <select
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value as SortMode)}
                    className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                  >
                    <option value="order-asc">Thu tu tang dan</option>
                    <option value="order-desc">Thu tu giam dan</option>
                    <option value="title-asc">Tieu de A-Z</option>
                  </select>
                </div>

                <div className="mt-5 grid max-h-[58vh] gap-3 overflow-y-auto pr-1">
                  {filteredLessons.map((lesson) => {
                    const isActive = panelMode !== 'create' && selectedLessonId === lesson.id;

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => {
                          setSelectedLessonId(lesson.id);
                          setPanelMode('detail');
                          setSystemMessage(null);
                        }}
                        className={[
                          'rounded-[1.4rem] border px-4 py-4 text-left transition',
                          isActive
                            ? 'border-violet-300 bg-violet-50'
                            : 'border-stroke bg-slate-50 hover:border-slate-300 hover:bg-white',
                        ].join(' ')}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-slate-950">Lesson {lesson.order}</p>
                          <div className="flex flex-wrap gap-2">
                            {lesson.isPreview ? (
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                                Preview
                              </span>
                            ) : null}
                            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                              {formatDurationMinutes(lesson.video.duration ?? 0)}
                            </span>
                          </div>
                        </div>
                        <h3 className="mt-3 line-clamp-2 text-base font-black tracking-tight text-slate-950">{lesson.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{lesson.description}</p>
                      </button>
                    );
                  })}

                  {!courseQuery.isPending && filteredLessons.length === 0 ? (
                    <div className="rounded-[1.4rem] border border-dashed border-stroke px-4 py-6 text-sm text-slate-500">
                      Chua co lesson nao khop search/filter hien tai.
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="self-start rounded-[2rem] border border-stroke bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-700">lesson body</p>
                    <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
                      {panelMode === 'create'
                        ? 'Create lesson'
                        : panelMode === 'edit'
                          ? 'Chinh sua lesson'
                          : selectedLesson
                            ? selectedLesson.title
                            : 'Chi tiet lesson'}
                    </h2>
                  </div>

                  {systemMessage ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {systemMessage}
                    </span>
                  ) : null}
                </div>

                {panelMode === 'create' ? (
                  <form
                    className="mt-5 grid gap-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      setSystemMessage(null);
                      createLessonMutation.mutate(buildLessonPayload(createDraft));
                    }}
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Tieu de lesson
                        <input
                          value={createDraft.title}
                          onChange={(event) => setCreateDraft((current) => ({ ...current, title: event.target.value }))}
                          className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Thu tu
                        <input
                          type="number"
                          min="1"
                          value={createDraft.order}
                          onChange={(event) => setCreateDraft((current) => ({ ...current, order: event.target.value }))}
                          className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                        />
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Duration (giay)
                        <input
                          type="number"
                          min="0"
                          value={createDraft.duration}
                          onChange={(event) => setCreateDraft((current) => ({ ...current, duration: event.target.value }))}
                          className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Thumbnail URL
                        <input
                          value={createDraft.thumbnail}
                          onChange={(event) => setCreateDraft((current) => ({ ...current, thumbnail: event.target.value }))}
                          className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                        />
                      </label>
                    </div>
                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Mo ta lesson
                      <textarea
                        rows={4}
                        value={createDraft.description}
                        onChange={(event) => setCreateDraft((current) => ({ ...current, description: event.target.value }))}
                        className="rounded-[1.3rem] border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Video URL
                      <input
                        value={createDraft.videoUrl}
                        onChange={(event) => setCreateDraft((current) => ({ ...current, videoUrl: event.target.value }))}
                        className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                      />
                    </label>
                    <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={createDraft.isPreview}
                        onChange={(event) => setCreateDraft((current) => ({ ...current, isPreview: event.target.checked }))}
                        className="size-4 rounded border-stroke"
                      />
                      Day la lesson preview
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={createLessonMutation.isPending}
                        className="btn-brand rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {createLessonMutation.isPending ? 'Dang tao lesson...' : 'Create lesson'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPanelMode(selectedLesson ? 'detail' : 'create')}
                        className="rounded-full border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                      >
                        {selectedLesson ? 'Quay lai chi tiet lesson' : 'Dung tao moi'}
                      </button>
                    </div>
                  </form>
                ) : panelMode === 'edit' && selectedLesson ? (
                  <form
                    className="mt-5 grid gap-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      setSystemMessage(null);
                      updateLessonMutation.mutate({
                        lessonId: selectedLesson.id,
                        payload: buildLessonUpdatePayload(editDraft),
                      });
                    }}
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Tieu de lesson
                        <input
                          value={editDraft.title}
                          onChange={(event) => setEditDraft((current) => ({ ...current, title: event.target.value }))}
                          className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Thu tu
                        <input
                          type="number"
                          min="1"
                          value={editDraft.order}
                          onChange={(event) => setEditDraft((current) => ({ ...current, order: event.target.value }))}
                          className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                        />
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Duration (giay)
                        <input
                          type="number"
                          min="0"
                          value={editDraft.duration}
                          onChange={(event) => setEditDraft((current) => ({ ...current, duration: event.target.value }))}
                          className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Thumbnail URL
                        <input
                          value={editDraft.thumbnail}
                          onChange={(event) => setEditDraft((current) => ({ ...current, thumbnail: event.target.value }))}
                          className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                        />
                      </label>
                    </div>
                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Mo ta lesson
                      <textarea
                        rows={4}
                        value={editDraft.description}
                        onChange={(event) => setEditDraft((current) => ({ ...current, description: event.target.value }))}
                        className="rounded-[1.3rem] border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Video URL
                      <input
                        value={editDraft.videoUrl}
                        onChange={(event) => setEditDraft((current) => ({ ...current, videoUrl: event.target.value }))}
                        className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                      />
                    </label>
                    <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={editDraft.isPreview}
                        onChange={(event) => setEditDraft((current) => ({ ...current, isPreview: event.target.checked }))}
                        className="size-4 rounded border-stroke"
                      />
                      Day la lesson preview
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={updateLessonMutation.isPending}
                        className="btn-brand rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {updateLessonMutation.isPending ? 'Dang luu...' : 'Luu lesson'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPanelMode('detail')}
                        className="rounded-full border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                      >
                        Quay lai chi tiet
                      </button>
                      <button
                        type="button"
                        disabled={deleteLessonMutation.isPending}
                        onClick={() => {
                          setSystemMessage(null);
                          void deleteLessonMutation.mutate(selectedLesson.id);
                        }}
                        className="rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 disabled:opacity-60"
                      >
                        {deleteLessonMutation.isPending ? 'Dang xoa...' : 'Xoa lesson'}
                      </button>
                    </div>
                  </form>
                ) : selectedLesson ? (
                  <div className="mt-5 space-y-4">
                    <div className="rounded-[1.35rem] border border-stroke bg-slate-50 px-4 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Lesson {selectedLesson.order}
                          </p>
                          <h3 className="mt-1 truncate text-xl font-black tracking-tight text-slate-950">{selectedLesson.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedLesson.isPreview ? (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                              Preview
                            </span>
                          ) : null}
                          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                            {formatDurationMinutes(selectedLesson.video.duration ?? 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <article className="rounded-[1.25rem] border border-stroke bg-slate-50 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Tieu de</p>
                        <p className="mt-2 text-base font-bold tracking-tight text-slate-950">{selectedLesson.title}</p>
                      </article>
                      <article className="rounded-[1.25rem] border border-stroke bg-slate-50 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Thu tu</p>
                        <p className="mt-2 text-base font-bold tracking-tight text-slate-950">{selectedLesson.order}</p>
                      </article>
                    </div>

                    <article className="rounded-[1.25rem] border border-stroke bg-slate-50 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Mo ta</p>
                      <p className="mt-2 text-sm leading-7 text-slate-700">{selectedLesson.description}</p>
                    </article>

                    <div className="grid gap-3 md:grid-cols-2">
                      <article className="rounded-[1.25rem] border border-stroke bg-slate-50 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Video URL</p>
                        <p className="mt-2 break-all text-sm leading-6 text-slate-700">{selectedLesson.video.videoUrl}</p>
                      </article>
                      <article className="rounded-[1.25rem] border border-stroke bg-slate-50 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Thumbnail</p>
                        <p className="mt-2 break-all text-sm leading-6 text-slate-700">
                          {selectedLesson.video.thumbnail || 'Chua co thumbnail'}
                        </p>
                      </article>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditDraft(createLessonDraft(selectedLesson));
                          setPanelMode('edit');
                        }}
                        className="btn-brand rounded-full px-5 py-3 text-sm font-semibold text-white"
                      >
                        Chinh sua lesson
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPanelMode('create');
                          setSystemMessage(null);
                          setCreateDraft(createLessonDraft());
                        }}
                        className="rounded-full border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                      >
                        Them lesson moi
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-[1.5rem] border border-dashed border-stroke px-5 py-8 text-sm text-slate-500">
                    Chon mot lesson ben trai de xem lesson body, hoac bam dau <span className="font-bold">+</span> de tao lesson moi.
                  </div>
                )}
              </section>
            </main>

            <footer className="rounded-[2rem] border border-white/70 bg-white/85 p-6 text-sm leading-7 text-slate-600 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
              Footer workspace nay duoc tach rieng de sau nay mo rong them bai tap, quiz theo lesson, attachments, assignment
              va workflow review noi dung ma khong can dap lai bo cuc course detail.
            </footer>
          </>
        ) : null}
      </div>
    </div>
  );
}
