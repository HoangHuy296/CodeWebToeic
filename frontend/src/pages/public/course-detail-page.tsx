import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../app/providers/auth-provider';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import {
  courseApi,
  type CreateCoursePayload,
} from '../../lib/course-api';
import { enrollmentApi, enrollmentQueryKeys } from '../../lib/enrollment-api';
import { getApiErrorMessage } from '../../lib/api';
import { formatCurrency, formatDurationMinutes, toYouTubeEmbed } from '../../lib/media';

interface CourseEditorDraft {
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: string;
  salePrice: string;
  thumbnail: string;
  isPublished: boolean;
}

function createCourseDraft(course?: {
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  salePrice?: number;
  thumbnail: string;
  isPublished: boolean;
}): CourseEditorDraft {
  return {
    title: course?.title ?? '',
    shortDescription: course?.shortDescription ?? '',
    description: course?.description ?? '',
    category: course?.category ?? '',
    level: course?.level ?? 'beginner',
    price: course ? String(course.price) : '',
    salePrice: typeof course?.salePrice === 'number' ? String(course.salePrice) : '',
    thumbnail: course?.thumbnail ?? '',
    isPublished: course?.isPublished ?? false,
  };
}

function buildCourseUpdatePayload(draft: CourseEditorDraft, isAdmin: boolean): Partial<CreateCoursePayload> {
  return {
    title: draft.title.trim(),
    shortDescription: draft.shortDescription.trim(),
    description: draft.description.trim(),
    category: draft.category.trim(),
    level: draft.level,
    price: Number(draft.price),
    salePrice: draft.salePrice.trim() ? Number(draft.salePrice) : undefined,
    thumbnail: draft.thumbnail.trim(),
    ...(isAdmin ? { isPublished: draft.isPublished } : {}),
  };
}

function resolveTeacherSubmitCopy(isAdmin: boolean): string {
  return isAdmin
    ? 'Dieu chinh thong tin khoa hoc, sau do luu de cap nhat ngay tren he thong.'
    : 'Teacher luu thay doi se dua khoa hoc ve trang thai cho admin phe duyet lai.';
}

export function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, role, user } = useAuth();
  const [enrollMessage, setEnrollMessage] = useState<string | null>(null);
  const [manageMessage, setManageMessage] = useState<string | null>(null);
  const [courseDraft, setCourseDraft] = useState<CourseEditorDraft>(createCourseDraft());
  const [isCourseEditorOpen, setIsCourseEditorOpen] = useState(false);

  const courseQuery = useQuery({
    queryKey: ['courses', 'detail', slug],
    enabled: Boolean(slug),
    queryFn: () => courseApi.detail(slug!),
  });
  const enrollmentsQuery = useQuery({
    queryKey: enrollmentQueryKeys.mine,
    queryFn: enrollmentApi.mine,
    enabled: isAuthenticated && role === 'student',
  });

  useEffect(() => {
    if (courseQuery.data) {
      setCourseDraft(createCourseDraft(courseQuery.data));
    }
  }, [courseQuery.data]);

  const course = courseQuery.data;
  const studentEnrollment = useMemo(() => {
    if (role !== 'student' || !course) {
      return null;
    }

    return (enrollmentsQuery.data ?? []).find((enrollment) => enrollment.course.id === course.id) ?? null;
  }, [course, enrollmentsQuery.data, role]);
  const isStudentEnrolled = Boolean(studentEnrollment);
  const isAdmin = role === 'admin';
  const isTeacherOwner = role === 'teacher' && Boolean(course && user?.id === course.owner.id);
  const canManageCourse = Boolean(course && (isAdmin || isTeacherOwner));
  const previewEmbed = course ? toYouTubeEmbed(course.introVideo.videoUrl) : null;
  const baseCourseDraft = useMemo(() => createCourseDraft(course), [course]);
  const hasUnsavedCourseChanges = JSON.stringify(courseDraft) !== JSON.stringify(baseCourseDraft);

  const invalidateCourseViews = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['courses'] }),
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', slug] }),
      queryClient.invalidateQueries({ queryKey: ['teacher', 'courses', 'mine'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] }),
    ]);
  };

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => enrollmentApi.enroll(courseId),
    onSuccess: () => {
      setEnrollMessage('Dang ky khoa hoc thanh cong.');
      void queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.mine });
      if (course) {
        navigate(`/student/learn/${course.id}`);
      }
    },
    onError: (error) => {
      setEnrollMessage(getApiErrorMessage(error));
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: (payload: Partial<CreateCoursePayload>) => courseApi.update(course!.id, payload),
    onSuccess: async () => {
      setManageMessage(
        isAdmin
          ? 'Cap nhat khoa hoc thanh cong.'
          : 'Da luu thay doi va gui khoa hoc ve admin phe duyet.',
      );
      setIsCourseEditorOpen(false);
      await invalidateCourseViews();
    },
    onError: (error) => {
      setManageMessage(getApiErrorMessage(error));
    },
  });

  const managementTone = useMemo(() => {
    if (isAdmin) {
      return {
        badge: 'Admin control',
        note: 'Admin co the CRUD bat ki khoa hoc nao ngay tai trang public detail.',
      };
    }

    return {
      badge: 'Teacher owner',
      note: 'Teacher duoc theo doi/chinh sua khoa hoc do minh so huu, ke ca khi course dang o draft va cho admin phe duyet lai.',
    };
  }, [isAdmin]);
  const sidebarActionLabel = !isAuthenticated
    ? 'Dang nhap de dang ky'
    : role === 'student'
      ? isStudentEnrolled
        ? 'Vao hoc'
        : enrollMutation.isPending
        ? 'Dang xu ly...'
        : 'Dang ky khoa hoc'
      : isTeacherOwner
        ? course?.isPublished
          ? 'Da xuat ban'
          : 'Ban nhap cua ban'
        : isAdmin
          ? 'Quan ly voi quyen admin'
          : 'Chi hoc vien moi dang ky';
  const lessonManagePath = isAdmin
    ? `/admin/courses/${course?.slug ?? slug}/lessons`
    : `/teacher/courses/${course?.slug ?? slug}/lessons`;

  const handleCloseCourseEditor = () => {
    if (!hasUnsavedCourseChanges) {
      setIsCourseEditorOpen(false);
      setManageMessage(null);
      return;
    }

    const shouldSave = window.confirm(
      'Form cap nhat khoa hoc dang co thay doi chua luu. Bam OK de luu chinh sua, bam Cancel de chon dong hoac tiep tuc sua.',
    );

    if (shouldSave) {
      setManageMessage(null);
      updateCourseMutation.mutate(buildCourseUpdatePayload(courseDraft, isAdmin));
      return;
    }

    const shouldDiscard = window.confirm(
      'Ban co muon dong form va bo cac thay doi chua luu khong?',
    );

    if (shouldDiscard) {
      setCourseDraft(baseCourseDraft);
      setManageMessage(null);
      setIsCourseEditorOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      {courseQuery.isPending ? <QueryLoadingState title="Dang tai chi tiet khoa hoc..." /> : null}
      {courseQuery.error ? (
        <QueryErrorState title="Khong tai duoc chi tiet khoa hoc" description={getApiErrorMessage(courseQuery.error)} />
      ) : null}

      {course ? (
        <>
          <PageHero eyebrow="course detail" title={course.title} description={course.shortDescription} />

          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="overflow-hidden rounded-[2rem] border border-stroke bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                {previewEmbed ? (
                  <iframe
                    title={course.title}
                    src={previewEmbed}
                    className="aspect-video w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <img src={course.thumbnail} alt={course.title} className="aspect-video w-full object-cover" />
                )}
              </div>

              {canManageCourse ? (
                <article className="rounded-[2rem] border border-teal-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,253,250,0.96))] p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-teal-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">
                        {managementTone.badge}
                      </span>
                      <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">Theo doi / Chinh sua khoa hoc ngay tren public detail</h2>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{managementTone.note}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-2xl border border-teal-100 bg-white/80 px-4 py-3 text-sm text-slate-600">
                        <p>
                          Trang thai: <span className="font-semibold text-slate-950">{course.isPublished ? 'Published' : 'Draft'}</span>
                        </p>
                        <p className="mt-1">
                          Review: <span className="font-semibold text-slate-950">{course.reviewStatus}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (isCourseEditorOpen) {
                            handleCloseCourseEditor();
                            return;
                          }

                          setCourseDraft(baseCourseDraft);
                          setManageMessage(null);
                          setIsCourseEditorOpen(true);
                        }}
                        className="rounded-full border border-teal-200 bg-white px-5 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
                      >
                        {isCourseEditorOpen ? 'Dong form cap nhat' : 'Chinh sua thong tin khoa hoc'}
                      </button>
                    </div>
                  </div>

                  {isCourseEditorOpen ? (
                    <form
                      className="mt-6 grid gap-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        setManageMessage(null);
                        updateCourseMutation.mutate(buildCourseUpdatePayload(courseDraft, isAdmin));
                      }}
                    >
                      <div>
                        <h3 className="text-xl font-black tracking-tight text-slate-950">Cap nhat khoa hoc</h3>
                        <p className="mt-2 text-sm text-slate-600">
                          {resolveTeacherSubmitCopy(isAdmin)}
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Tieu de khoa hoc
                          <input
                            value={courseDraft.title}
                            onChange={(event) => setCourseDraft((current) => ({ ...current, title: event.target.value }))}
                            className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none transition focus:border-teal-400"
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Category
                          <input
                            value={courseDraft.category}
                            onChange={(event) => setCourseDraft((current) => ({ ...current, category: event.target.value }))}
                            className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none transition focus:border-teal-400"
                          />
                        </label>
                      </div>

                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Mo ta ngan
                        <textarea
                          rows={3}
                          value={courseDraft.shortDescription}
                          onChange={(event) => setCourseDraft((current) => ({ ...current, shortDescription: event.target.value }))}
                          className="rounded-[1.3rem] border border-stroke bg-white px-4 py-3 outline-none transition focus:border-teal-400"
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Mo ta chi tiet
                        <textarea
                          rows={5}
                          value={courseDraft.description}
                          onChange={(event) => setCourseDraft((current) => ({ ...current, description: event.target.value }))}
                          className="rounded-[1.3rem] border border-stroke bg-white px-4 py-3 outline-none transition focus:border-teal-400"
                        />
                      </label>

                      <div className="grid gap-4 md:grid-cols-4">
                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Level
                          <select
                            value={courseDraft.level}
                            onChange={(event) =>
                              setCourseDraft((current) => ({
                                ...current,
                                level: event.target.value as CourseEditorDraft['level'],
                              }))
                            }
                            className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none transition focus:border-teal-400"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </label>
                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Gia goc
                          <input
                            type="number"
                            min="0"
                            value={courseDraft.price}
                            onChange={(event) => setCourseDraft((current) => ({ ...current, price: event.target.value }))}
                            className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none transition focus:border-teal-400"
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Gia uu dai
                          <input
                            type="number"
                            min="0"
                            value={courseDraft.salePrice}
                            onChange={(event) => setCourseDraft((current) => ({ ...current, salePrice: event.target.value }))}
                            className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none transition focus:border-teal-400"
                          />
                        </label>
                        {isAdmin ? (
                          <label className="flex items-center gap-3 rounded-2xl border border-stroke bg-white px-4 py-3 text-sm font-semibold text-slate-700 md:self-end">
                            <input
                              type="checkbox"
                              checked={courseDraft.isPublished}
                              onChange={(event) => setCourseDraft((current) => ({ ...current, isPublished: event.target.checked }))}
                              className="size-4 rounded border-stroke"
                            />
                            Dang publish
                          </label>
                        ) : (
                          <div className="rounded-2xl border border-stroke bg-white px-4 py-3 text-sm text-slate-600 md:self-end">
                            Teacher dang cap nhat course cua minh va gui lai admin phe duyet khi course dang o draft.
                          </div>
                        )}
                      </div>

                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Thumbnail URL
                        <input
                          value={courseDraft.thumbnail}
                          onChange={(event) => setCourseDraft((current) => ({ ...current, thumbnail: event.target.value }))}
                          className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none transition focus:border-teal-400"
                        />
                      </label>

                      {manageMessage ? (
                        <p className="text-sm font-medium text-slate-600">{manageMessage}</p>
                      ) : null}

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={updateCourseMutation.isPending}
                          className="btn-brand rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {updateCourseMutation.isPending
                            ? 'Dang luu khoa hoc...'
                            : isAdmin
                              ? 'Luu'
                              : 'Luu va gui phe duyet'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCloseCourseEditor}
                          className="rounded-full border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Dong
                        </button>
                      </div>
                    </form>
                  ) : null}
                </article>
              ) : null}

              <article className="rounded-[2rem] border border-stroke bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <h2 className="text-2xl font-black tracking-tight text-slate-950">Mo ta khoa hoc</h2>
                <p className="mt-4 text-sm leading-8 text-slate-600">{course.description}</p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {course.benefits.map((benefit) => (
                    <div key={benefit} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700">
                      {benefit}
                    </div>
                  ))}
                </div>

                {canManageCourse ? (
                  <div className="mt-6">
                    <Link
                      to={lessonManagePath}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-full border border-teal-200 bg-white px-5 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
                    >
                      Lesson List
                    </Link>
                  </div>
                ) : null}
              </article>

              <article className="rounded-[2rem] border border-stroke bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-black tracking-tight text-slate-950">Lesson list</h2>
                  <span className="rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                    {course.lessonCount} lessons
                  </span>
                </div>

                <div className="mt-6 grid gap-4">
                  {(course.lessons ?? []).map((lesson) => (
                    <article key={lesson.id} className="rounded-[1.5rem] border border-stroke bg-slate-50 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Lesson {lesson.order}
                          </p>
                          <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-950">{lesson.title}</h3>
                        </div>
                        {lesson.isPreview ? (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                            Preview
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{lesson.description}</p>
                    </article>
                  ))}
                </div>
              </article>
            </div>

            <aside className="space-y-6">
              <article className="rounded-[2rem] border border-stroke bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">{course.category}</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  {course.salePrice ? formatCurrency(course.salePrice) : formatCurrency(course.price)}
                </h2>
                {course.salePrice ? (
                  <p className="mt-2 text-sm text-slate-400 line-through">{formatCurrency(course.price)}</p>
                ) : null}

                <div className="mt-6 grid gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tong thoi luong</p>
                    <p className="mt-2 font-bold text-slate-900">{formatDurationMinutes(course.totalDuration)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Giang vien</p>
                    <p className="mt-2 font-bold text-slate-900">{course.owner.fullName ?? 'IVYTS 1997'}</p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!isAuthenticated || role !== 'student' || enrollMutation.isPending}
                  onClick={() => {
                    setEnrollMessage(null);
                    if (isStudentEnrolled) {
                      navigate(`/student/learn/${course.id}`);
                      return;
                    }

                    void enrollMutation.mutate(course.id);
                  }}
                  className="mt-6 w-full rounded-2xl bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-deep))] px-5 py-4 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(13,148,136,0.24)] transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sidebarActionLabel}
                </button>

                {enrollMessage ? <p className="mt-4 text-sm font-medium text-slate-600">{enrollMessage}</p> : null}
              </article>

              <article className="rounded-[2rem] border border-stroke bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <h3 className="text-xl font-black tracking-tight text-slate-950">Tai lieu di kem</h3>
                <div className="mt-5 grid gap-3">
                  {course.materials.map((material) => (
                    <a
                      key={material.fileUrl}
                      href={material.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      {material.title}
                    </a>
                  ))}
                </div>
              </article>
            </aside>
          </section>
        </>
      ) : null}
    </div>
  );
}
