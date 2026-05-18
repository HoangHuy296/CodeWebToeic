import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../app/providers/notification-provider';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { courseApi } from '../../lib/course-api';
import { getApiErrorMessage } from '../../lib/api';
import { formatCurrency, parseCommaList, parseLineList } from '../../lib/format';
import type { Course } from '../../types/course';

interface CourseEditDraft {
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  level: Course['level'];
  price: string;
  salePrice: string;
  thumbnail: string;
  introVideoUrl: string;
  introVideoProvider: Course['introVideo']['videoProvider'];
  introDuration: string;
  introThumbnail: string;
  tagsText: string;
  benefitsText: string;
  reviewNote: string;
}

interface ReviewModalState {
  courseId: string;
  courseTitle: string;
  reviewStatus: Extract<Course['reviewStatus'], 'changes_requested' | 'rejected'>;
  reviewNote: string;
}

function createCourseDraft(course: Course): CourseEditDraft {
  return {
    title: course.title,
    shortDescription: course.shortDescription,
    description: course.description,
    category: course.category,
    level: course.level,
    price: String(course.price),
    salePrice: course.salePrice ? String(course.salePrice) : '',
    thumbnail: course.thumbnail,
    introVideoUrl: course.introVideo.videoUrl,
    introVideoProvider: course.introVideo.videoProvider,
    introDuration: String(course.introVideo.duration ?? 0),
    introThumbnail: course.introVideo.thumbnail ?? '',
    tagsText: course.tags.join(', '),
    benefitsText: course.benefits.join('\n'),
    reviewNote: course.reviewNote ?? '',
  };
}

const reviewStatusMeta: Record<Course['reviewStatus'], { label: string; className: string }> = {
  pending_review: {
    label: 'cho phe duyet',
    className: 'bg-sky-100 text-sky-800',
  },
  changes_requested: {
    label: 'yeu cau chinh sua',
    className: 'bg-amber-100 text-amber-800',
  },
  rejected: {
    label: 'tu choi',
    className: 'bg-rose-100 text-rose-800',
  },
  approved: {
    label: 'da phe duyet',
    className: 'bg-emerald-100 text-emerald-800',
  },
};

function resolveReviewStatus(course: Course): Course['reviewStatus'] {
  return course.reviewStatus ?? 'pending_review';
}

function resolveReviewNote(course: Course): string {
  return course.reviewNote ?? '';
}

function ReviewActionModal({
  state,
  onClose,
  onConfirm,
  isSubmitting,
}: {
  state: ReviewModalState;
  onClose: () => void;
  onConfirm: (reviewNote: string) => void;
  isSubmitting: boolean;
}) {
  const [reviewNote, setReviewNote] = useState(state.reviewNote);
  const title = state.reviewStatus === 'changes_requested' ? 'Yeu cau giang vien chinh sua' : 'Tu choi khoa hoc';
  const description =
    state.reviewStatus === 'changes_requested'
      ? 'Nhap ghi chu cu the de giang vien biet phan nao can cap nhat truoc khi gui lai review.'
      : 'Nhap ly do tu choi de giang vien nhan duoc phan hoi ro rang tu admin.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">review note</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
            <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              {state.courseTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Dong
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <textarea
            rows={6}
            value={reviewNote}
            onChange={(event) => setReviewNote(event.target.value)}
            placeholder="Nhap review note cho giang vien"
            className="rounded-[1.5rem] border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Huy
            </button>
            <button
              type="button"
              disabled={isSubmitting || !reviewNote.trim()}
              onClick={() => onConfirm(reviewNote.trim())}
              className={[
                'rounded-2xl px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-60',
                state.reviewStatus === 'changes_requested'
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-rose-600 hover:bg-rose-700',
              ].join(' ')}
            >
              {isSubmitting ? 'Dang gui...' : state.reviewStatus === 'changes_requested' ? 'Gui yeu cau chinh sua' : 'Xac nhan tu choi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const { pushClientNotification } = useNotifications();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<CourseEditDraft | null>(null);
  const [reviewModalState, setReviewModalState] = useState<ReviewModalState | null>(null);
  const coursesQuery = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: courseApi.manageMine,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => courseApi.remove(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ]);
    },
    onError: (error) => {
      pushClientNotification({
        title: 'Xoa khoa hoc that bai',
        message: getApiErrorMessage(error),
        severity: 'error',
        entityType: 'course',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; draft: CourseEditDraft }) =>
      courseApi.update(payload.id, {
        title: payload.draft.title,
        shortDescription: payload.draft.shortDescription,
        description: payload.draft.description,
        category: payload.draft.category,
        level: payload.draft.level,
        price: Number(payload.draft.price),
        ...(payload.draft.salePrice.trim() ? { salePrice: Number(payload.draft.salePrice) } : { salePrice: 0 }),
        thumbnail: payload.draft.thumbnail,
        introVideo: {
          videoUrl: payload.draft.introVideoUrl,
          videoProvider: payload.draft.introVideoProvider,
          duration: Number(payload.draft.introDuration) || 0,
          ...(payload.draft.introThumbnail.trim() ? { thumbnail: payload.draft.introThumbnail.trim() } : {}),
        },
        tags: parseCommaList(payload.draft.tagsText),
        benefits: parseLineList(payload.draft.benefitsText),
        reviewNote: payload.draft.reviewNote.trim() || undefined,
      }),
    onSuccess: async () => {
      setEditingCourseId(null);
      setEditDraft(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] }),
        queryClient.invalidateQueries({ queryKey: ['teacher', 'courses', 'mine'] }),
        queryClient.invalidateQueries({ queryKey: ['courses'] }),
      ]);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      reviewStatus,
      reviewNote,
    }: {
      id: string;
      reviewStatus: Course['reviewStatus'];
      reviewNote?: string;
    }) =>
      courseApi.update(id, {
        reviewStatus,
        reviewNote,
        isPublished: reviewStatus === 'approved',
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] }),
        queryClient.invalidateQueries({ queryKey: ['teacher', 'courses', 'mine'] }),
        queryClient.invalidateQueries({ queryKey: ['courses'] }),
      ]);
    },
  });

  const courses = (coursesQuery.data ?? []).filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'published' ? course.isPublished : !course.isPublished;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.35em] text-teal-700 uppercase">admin courses</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Bang review, phe duyet va dong goi khoa hoc.</h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">
              Admin co the review khoa hoc do giang vien gui len, yeu cau chinh sua, tu choi hoac phe duyet va publish ngay tu trang nay.
            </p>
          </div>

          <Link
            to="/admin/courses/create"
            className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Tao khoa hoc moi
          </Link>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tim theo ten khoa hoc hoac category"
            className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-400"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-400"
          >
            <option value="all">Tat ca trang thai</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {coursesQuery.isPending ? <div className="mt-6"><QueryLoadingState title="Dang tai danh sach khoa hoc..." /></div> : null}
        {coursesQuery.error ? (
          <div className="mt-6">
            <QueryErrorState title="Khong tai duoc courses" description={getApiErrorMessage(coursesQuery.error)} />
          </div>
        ) : null}
        {(deleteMutation.error || updateMutation.error || reviewMutation.error) ? (
          <div className="mt-6">
            <QueryErrorState
              title="Khong cap nhat duoc khoa hoc"
              description={getApiErrorMessage(deleteMutation.error ?? updateMutation.error ?? reviewMutation.error)}
            />
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          {courses.map((course) => (
            (() => {
              const reviewStatus = resolveReviewStatus(course);
              return (
            <article key={course.id} className="rounded-[1.6rem] border border-stroke bg-slate-50 p-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black tracking-tight text-slate-950">{course.title}</h2>
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]',
                        course.isPublished ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800',
                      ].join(' ')}
                    >
                      {course.isPublished ? 'published' : 'draft'}
                    </span>
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                      {course.level}
                    </span>
                    <span className={['rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]', reviewStatusMeta[reviewStatus].className].join(' ')}>
                      {reviewStatusMeta[reviewStatus].label}
                    </span>
                  </div>

                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{course.shortDescription}</p>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                    <span>{course.category}</span>
                    <span>{course.lessonCount} lessons</span>
                    <span>{course.totalDuration} giay video</span>
                    <span>{formatCurrency(course.salePrice ?? course.price)}</span>
                    <span>{course.owner.fullName ?? course.owner.email ?? 'No owner'}</span>
                  </div>

                  {resolveReviewNote(course) ? (
                    <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-slate-600">
                      Review note: {resolveReviewNote(course)}
                    </p>
                  ) : null}
                </div>

                <div className="w-full xl:w-[430px]">
                  <div className="grid gap-3">
                    <div className="rounded-[1.4rem] border border-stroke bg-white p-3">
                      <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Review actions
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {!course.isPublished ? (
                          <button
                            type="button"
                            disabled={reviewMutation.isPending}
                            onClick={() => reviewMutation.mutate({ id: course.id, reviewStatus: 'approved', reviewNote: '' })}
                            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Phe duyet va publish
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={reviewMutation.isPending}
                          onClick={() =>
                            setReviewModalState({
                              courseId: course.id,
                              courseTitle: course.title,
                              reviewStatus: 'changes_requested',
                              reviewNote: resolveReviewNote(course),
                            })
                          }
                          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Yeu cau chinh sua
                        </button>
                        <button
                          type="button"
                          disabled={reviewMutation.isPending}
                          onClick={() =>
                            setReviewModalState({
                              courseId: course.id,
                              courseTitle: course.title,
                              reviewStatus: 'rejected',
                              reviewNote: resolveReviewNote(course),
                            })
                          }
                          className={[
                            'rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60',
                            course.isPublished ? '' : 'sm:col-span-2',
                          ].join(' ')}
                        >
                          Tu choi
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-stroke bg-white p-3">
                      <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Manage actions
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCourseId((current) => (current === course.id ? null : course.id));
                            setEditDraft(createCourseDraft(course));
                          }}
                          className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                        >
                          {editingCourseId === course.id ? 'Dong editor' : 'Chinh sua'}
                        </button>
                        <Link
                          to={`/courses/${course.slug}`}
                          className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                        >
                          Xem public page
                        </Link>
                        <Link
                          to={`/admin/courses/${course.slug}/lessons`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                        >
                          Lesson List
                        </Link>
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm(`Xoa khoa hoc "${course.title}"?`)) {
                              deleteMutation.mutate(course.id);
                            }
                          }}
                          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Xoa khoa hoc
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {editingCourseId === course.id && editDraft ? (
                <form
                  className="mt-6 grid gap-4 rounded-[1.5rem] border border-stroke bg-white p-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    updateMutation.mutate({ id: course.id, draft: editDraft });
                  }}
                >
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">course editor</p>
                      <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">CRUD thong tin khoa hoc ngay tai dashboard</h3>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={editDraft.title}
                      onChange={(event) => setEditDraft((current) => current ? { ...current, title: event.target.value } : current)}
                      placeholder="Ten khoa hoc"
                      className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
                    />
                    <input
                      value={editDraft.category}
                      onChange={(event) => setEditDraft((current) => current ? { ...current, category: event.target.value } : current)}
                      placeholder="Category"
                      className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <select
                      value={editDraft.level}
                      onChange={(event) => setEditDraft((current) => current ? { ...current, level: event.target.value as Course['level'] } : current)}
                      className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    <input
                      value={editDraft.price}
                      onChange={(event) => setEditDraft((current) => current ? { ...current, price: event.target.value } : current)}
                      placeholder="Gia goc"
                      className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
                    />
                    <input
                      value={editDraft.salePrice}
                      onChange={(event) => setEditDraft((current) => current ? { ...current, salePrice: event.target.value } : current)}
                      placeholder="Gia uu dai"
                      className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
                    />
                  </div>

                  <textarea
                    rows={3}
                    value={editDraft.shortDescription}
                    onChange={(event) => setEditDraft((current) => current ? { ...current, shortDescription: event.target.value } : current)}
                    placeholder="Mo ta ngan"
                    className="rounded-[1.5rem] border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
                  />

                  <textarea
                    rows={5}
                    value={editDraft.description}
                    onChange={(event) => setEditDraft((current) => current ? { ...current, description: event.target.value } : current)}
                    placeholder="Mo ta chi tiet"
                    className="rounded-[1.5rem] border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={editDraft.thumbnail}
                      onChange={(event) => setEditDraft((current) => current ? { ...current, thumbnail: event.target.value } : current)}
                      placeholder="Thumbnail URL"
                      className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
                    />
                    <input
                      value={editDraft.introVideoUrl}
                      onChange={(event) => setEditDraft((current) => current ? { ...current, introVideoUrl: event.target.value } : current)}
                      placeholder="Intro video URL"
                      className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <select
                      value={editDraft.introVideoProvider}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current ? { ...current, introVideoProvider: event.target.value as Course['introVideo']['videoProvider'] } : current,
                        )
                      }
                      className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                      <option value="cloudinary">Cloudinary</option>
                      <option value="bunny">Bunny</option>
                      <option value="s3">S3</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      value={editDraft.introDuration}
                      onChange={(event) => setEditDraft((current) => current ? { ...current, introDuration: event.target.value } : current)}
                      placeholder="Duration giay"
                      className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
                    />
                    <input
                      value={editDraft.introThumbnail}
                      onChange={(event) => setEditDraft((current) => current ? { ...current, introThumbnail: event.target.value } : current)}
                      placeholder="Intro thumbnail URL"
                      className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <textarea
                      rows={4}
                      value={editDraft.tagsText}
                      onChange={(event) => setEditDraft((current) => current ? { ...current, tagsText: event.target.value } : current)}
                      placeholder="Tags, cach nhau boi dau phay"
                      className="rounded-[1.5rem] border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
                    />
                    <textarea
                      rows={4}
                      value={editDraft.benefitsText}
                      onChange={(event) => setEditDraft((current) => current ? { ...current, benefitsText: event.target.value } : current)}
                      placeholder="Moi dong la 1 benefit"
                      className="rounded-[1.5rem] border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
                    />
                  </div>

                  <textarea
                    rows={3}
                    value={editDraft.reviewNote}
                    onChange={(event) => setEditDraft((current) => current ? { ...current, reviewNote: event.target.value } : current)}
                    placeholder="Review note danh cho giang vien"
                    className="rounded-[1.5rem] border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
                  />

                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCourseId(null);
                        setEditDraft(null);
                      }}
                      className="rounded-2xl border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                    >
                      Huy
                    </button>
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updateMutation.isPending ? 'Dang cap nhat...' : 'Luu thay doi'}
                    </button>
                  </div>
                </form>
              ) : null}
            </article>
              );
            })()
          ))}

          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stroke px-4 py-6 text-sm text-slate-500">
              Chua co khoa hoc nao phu hop bo loc.
            </div>
          ) : null}
        </div>
      </section>

      {reviewModalState ? (
        <ReviewActionModal
          state={reviewModalState}
          isSubmitting={reviewMutation.isPending}
          onClose={() => {
            if (!reviewMutation.isPending) {
              setReviewModalState(null);
            }
          }}
          onConfirm={(reviewNote) => {
            reviewMutation.mutate(
              {
                id: reviewModalState.courseId,
                reviewStatus: reviewModalState.reviewStatus,
                reviewNote,
              },
              {
                onSuccess: async () => {
                  setReviewModalState(null);
                  await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] }),
                    queryClient.invalidateQueries({ queryKey: ['teacher', 'courses', 'mine'] }),
                    queryClient.invalidateQueries({ queryKey: ['courses'] }),
                  ]);
                },
              },
            );
          }}
        />
      ) : null}
    </div>
  );
}
