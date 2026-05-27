import { Link } from 'react-router-dom';
import { useAuth } from '../../app/providers/auth-provider';
import type { Course } from '../../types/course';
import { formatDurationMinutes } from '../../lib/media';

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
}

export function CourseCard({ course, isEnrolled = false }: CourseCardProps) {
  const { role, user } = useAuth();
  const discountPercent = course.salePrice
    ? Math.max(0, Math.round(((course.price - course.salePrice) / course.price) * 100))
    : 0;
  const canTeacherTrackCourse =
    role === 'teacher' && user?.id === course.owner.id && course.isPublished;
  const actionPath = isEnrolled ? `/student/learn/${course.id}` : `/courses/${course.slug}`;
  const actionLabel = isEnrolled ? 'Vao hoc' : canTeacherTrackCourse ? 'Theo doi/Chinh sua' : 'Xem chi tiet';
  const levelLabel =
    course.level === 'beginner'
      ? 'Foundation'
      : course.level === 'intermediate'
        ? 'Score Boost'
        : 'Advanced Lab';
  const audienceLabel =
    course.level === 'beginner'
      ? 'Mat goc / can lo trinh'
      : course.level === 'intermediate'
        ? 'Can tang diem nhanh'
        : 'Muc tieu diem cao';
  const featureLabel =
    course.level === 'beginner'
      ? 'Structured starter roadmap'
      : course.level === 'intermediate'
        ? 'Weekly score acceleration'
        : 'Advanced test strategy';
  const tagPreview = course.tags.slice(0, 3);
  const benefitPreview = course.benefits.slice(0, 2);

  return (
    <article className="group grid overflow-hidden rounded-[1.55rem] border border-stroke bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,252,252,0.98))] shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1.5 hover:border-teal-200 hover:shadow-[0_28px_64px_rgba(15,23,42,0.13)]">
      <div className="relative">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.8))]" />
        </div>

        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
          <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800 shadow-sm">
            {course.category}
          </span>

          <div className="flex flex-wrap justify-end gap-2">
            {discountPercent > 0 ? (
              <span className="rounded-full bg-[linear-gradient(135deg,#fb7185,#f97316)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_14px_28px_rgba(249,115,22,0.26)]">
                Promotion
              </span>
            ) : null}
            {isEnrolled ? (
              <span className="rounded-full bg-emerald-100/95 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-800 shadow-sm">
                Owned
              </span>
            ) : null}
          </div>
        </div>

        <div className="absolute inset-x-4 bottom-4 grid gap-3">
          <div className="inline-flex max-w-max items-center rounded-full bg-black/45 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-100 backdrop-blur">
            {featureLabel}
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-[1.15rem] bg-white/95 px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.14)] backdrop-blur">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Lessons</p>
              <p className="mt-1 text-sm font-black text-slate-900">{course.lessonCount}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Duration</p>
              <p className="mt-1 text-sm font-black text-slate-900">{formatDurationMinutes(course.totalDuration)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5">
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
              {levelLabel}
            </span>
            {course.reviewStatus === 'approved' ? (
              <span className="rounded-full bg-sky-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">
                Live cohort
              </span>
            ) : null}
          </div>

          <h3 className="mt-3 line-clamp-2 text-xl font-black leading-7 text-slate-950">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {course.shortDescription}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tagPreview.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="rounded-[1.2rem] border border-teal-100 bg-[linear-gradient(135deg,rgba(240,253,250,0.92),rgba(239,246,255,0.92))] p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                Learning outcome
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                {benefitPreview.length > 0 ? benefitPreview.join(' • ') : audienceLabel}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-slate-700 shadow-sm">
              {discountPercent > 0 ? `Save ${discountPercent}%` : 'Guided'}
            </span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="min-w-0 rounded-[1rem] bg-slate-50 px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Best for
            </p>
            <p className="mt-1 truncate text-sm font-bold text-slate-700">
              {audienceLabel}
            </p>
          </div>

          <Link
            to={actionPath}
            className="btn-brand inline-flex min-w-[170px] items-center justify-center rounded-xl px-4 py-3 text-sm font-bold text-white transition"
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
