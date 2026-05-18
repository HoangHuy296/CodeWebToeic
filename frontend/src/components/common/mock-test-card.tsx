import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/providers/auth-provider';
import type { MockTest } from '../../types/mock-test';

const statusLabel: Record<MockTest['status'], string> = {
  published: 'San sang',
  draft: 'Ban nhap',
  archived: 'Luu tru',
};

export function MockTestCard({ mockTest }: { mockTest: MockTest }) {
  const { role, user } = useAuth();
  const location = useLocation();
  const isTeacherOwner = role === 'teacher' && user?.id === mockTest.createdBy.id;
  const isTeacherPreviewPlay = role === 'teacher' && !isTeacherOwner;
  const studentMockTestPath =
    location.pathname === '/mock-test'
      ? `/student/mock-tests/${mockTest.id}?from=public`
      : `/student/mock-tests/${mockTest.id}`;
  const isOwner = (role === 'teacher' || role === 'admin') && user?.id === mockTest.createdBy.id;
  const isFreeTest = mockTest.status === 'published' && mockTest.assignedCourseIds.length === 0;
  const isAssignedTest = mockTest.assignedCourseIds.length > 0;
  const ctaPath =
    role === 'student'
      ? studentMockTestPath
      : role === 'teacher' && isTeacherOwner
        ? `/teacher/mock-tests/${mockTest.id}`
        : role === 'teacher' && isTeacherPreviewPlay
          ? `/teacher/mock-tests/play/${mockTest.id}`
          : role === 'admin'
            ? `/admin/mock-tests/${mockTest.id}`
            : '/login';
  const ctaLabel =
    role === 'student'
      ? 'Bat dau lam bai'
      : role === 'teacher' && isTeacherOwner
        ? 'Quan ly bai thi'
        : role === 'teacher' && isTeacherPreviewPlay
          ? 'Xem bai thi'
          : role === 'admin'
            ? 'Mo workspace'
            : 'Dang nhap de lam bai';

  return (
    <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
        <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-700">{mockTest.type}</span>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{mockTest.level}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{statusLabel[mockTest.status]}</span>
        {isFreeTest ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Free</span>
        ) : null}
        {isAssignedTest ? (
          <span className="rounded-full bg-cyan-100 px-3 py-1 text-cyan-700">Assigned</span>
        ) : null}
        {isOwner ? (
          <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-700">Your mock test</span>
        ) : null}
      </div>

      <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950">{mockTest.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{mockTest.description}</p>

      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">So cau</p>
          <p className="mt-1 font-bold text-slate-900">{mockTest.questionCount}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Thoi luong</p>
          <p className="mt-1 font-bold text-slate-900">{mockTest.durationMinutes} phut</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Muc do</p>
          <p className="mt-1 font-bold text-slate-900">{mockTest.level}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          By {mockTest.createdBy.fullName ?? 'IVYTS 1997'}
        </p>
        <Link
          to={ctaPath}
          className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}
