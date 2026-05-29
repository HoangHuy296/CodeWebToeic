import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/providers/auth-provider';
import type { MockTest } from '../../types/mock-test';

interface ExerciseCardProps {
  exercise: MockTest;
  topicLabel?: string;
}

export function ExerciseCard({ exercise, topicLabel }: ExerciseCardProps) {
  const { role, user } = useAuth();
  const location = useLocation();

  const isTeacherOwner = role === 'teacher' && user?.id === exercise.createdBy.id;
  const isTeacherPreviewPlay = role === 'teacher' && !isTeacherOwner;
  const isPublicExerciseFlow = location.pathname === '/exercises' || location.pathname.startsWith('/exercises/');
  const studentExercisePath = isPublicExerciseFlow
    ? `/student/mock-tests/${exercise.id}?from=public&catalog=exercise`
    : `/student/mock-tests/${exercise.id}?catalog=exercise`;

  const ctaPath =
    role === 'student'
      ? studentExercisePath
      : role === 'teacher' && isTeacherOwner
        ? `/teacher/exercises/items/${exercise.id}`
        : role === 'teacher' && isTeacherPreviewPlay
          ? `/teacher/mock-tests/play/${exercise.id}?catalog=exercise`
          : role === 'admin'
            ? `/admin/exercises/items/${exercise.id}`
            : '/login';

  const ctaLabel =
    role === 'student'
      ? 'Lam bai tap'
      : role === 'teacher' && isTeacherOwner
        ? 'Quan ly bai tap'
        : role === 'teacher' && isTeacherPreviewPlay
          ? 'Xem bai tap'
          : role === 'admin'
            ? 'Mo workspace'
            : 'Dang nhap de lam bai';

  return (
    <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
        {topicLabel ? <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-700">{topicLabel}</span> : null}
        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{exercise.level}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{exercise.type}</span>
      </div>

      <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950">{exercise.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{exercise.description}</p>

      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">So cau</p>
          <p className="mt-1 font-bold text-slate-900">{exercise.questionCount}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Thoi luong</p>
          <p className="mt-1 font-bold text-slate-900">{exercise.durationMinutes} phut</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Nguoi tao</p>
          <p className="mt-1 font-bold text-slate-900">{exercise.createdBy.fullName ?? 'IVYTS 1997'}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Bai tap theo chu de on tap va luyen nhanh.</p>
        <Link to={ctaPath} className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}
