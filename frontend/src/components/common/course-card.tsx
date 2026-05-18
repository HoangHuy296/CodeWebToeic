import { Link } from 'react-router-dom';
import { useAuth } from '../../app/providers/auth-provider';
import type { Course } from '../../types/course';
import { formatCurrency, formatDurationMinutes } from '../../lib/media';

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
}

export function CourseCard({ course, isEnrolled = false }: CourseCardProps) {
  const { role, user } = useAuth();
  const discountPercent = course.salePrice
    ? Math.max(0, Math.round(((course.price - course.salePrice) / course.price) * 100))
    : 0;
  const effectivePrice = course.salePrice ?? course.price;
  const savedAmount = course.price - effectivePrice;
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

  return (
    <article className="group grid overflow-hidden rounded-[1.35rem] border border-stroke bg-white shadow-[0_14px_36px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_24px_58px_rgba(15,23,42,0.12)]">
      <div className="relative">
        <div className="relative aspect-[17/10] overflow-hidden bg-slate-100">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0.72))]" />
        </div>

        <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-3">
          <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-800 shadow-sm">
            {course.category}
          </span>
          {discountPercent > 0 ? (
            <span className="rounded-full bg-[linear-gradient(135deg,#f97316,#e11d48)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_28px_rgba(249,115,22,0.26)]">
              Save {discountPercent}%
            </span>
          ) : null}
        </div>

        <div className="absolute inset-x-4 bottom-4">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-white/94 px-3 py-2 shadow-[0_12px_28px_rgba(15,23,42,0.14)] backdrop-blur">
            <span className="text-xs font-bold text-slate-800">{course.lessonCount} lessons</span>
            <span className="text-xs font-bold text-slate-800">{formatDurationMinutes(course.totalDuration)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
              {levelLabel}
            </span>
            {isEnrolled ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                Owned
              </span>
            ) : null}
          </div>

          <h3 className="mt-3 line-clamp-2 text-lg font-black leading-6 text-slate-950">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {course.shortDescription}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {course.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="rounded-[1.15rem] border border-teal-100 bg-[linear-gradient(135deg,rgba(240,253,250,0.92),rgba(239,246,255,0.9))] p-4">
          {discountPercent > 0 ? (
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-600">
                  Tiet kiem {formatCurrency(savedAmount)}
                </p>
                <div className="mt-1 flex flex-wrap items-end gap-2">
                  <span className="text-xl font-black tracking-tight text-slate-950">
                    {formatCurrency(effectivePrice)}
                  </span>
                  <span className="text-sm text-slate-400 line-through">
                    {formatCurrency(course.price)}
                  </span>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-rose-600 shadow-sm">
                Promo
              </span>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Gia khoa hoc
                </p>
                <span className="mt-1 block text-xl font-black tracking-tight text-slate-950">
                  {formatCurrency(course.price)}
                </span>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600 shadow-sm">
                Ready
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Best for
            </p>
            <p className="mt-1 truncate text-sm font-bold text-slate-700">
              {audienceLabel}
            </p>
          </div>

          <Link
            to={actionPath}
            className="btn-brand inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-bold text-white transition"
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
