import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../app/providers/auth-provider';
import { MockTestCard } from '../../components/common/mock-test-card';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { getApiErrorMessage } from '../../lib/api';
import { mockTestApi } from '../../lib/mock-test-api';

export function MockTestLandingPage() {
  const { role, user } = useAuth();
  const [typeFilter, setTypeFilter] = useState<'all' | 'mini-test' | 'full-test' | 'practice-set'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  const mockTestsQuery = useQuery({
    queryKey: ['mock-tests', 'public-list'],
    queryFn: mockTestApi.list,
  });

  const filteredTests = useMemo(() => {
    return (mockTestsQuery.data ?? []).filter((item) => {
      const matchType = typeFilter === 'all' || item.type === typeFilter;
      const matchLevel = levelFilter === 'all' || item.level === levelFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchType && matchLevel && matchStatus;
    });
  }, [levelFilter, mockTestsQuery.data, statusFilter, typeFilter]);
  const teacherOwnedCount =
    role === 'teacher'
      ? filteredTests.filter((item) => item.createdBy.id === user?.id).length
      : 0;
  const publicPublishedCount =
    role === 'teacher'
      ? filteredTests.filter((item) => item.status === 'published' && item.assignedCourseIds.length === 0).length
      : 0;

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="mock tests"
        title="Kho bai thi TOEIC va IELTS de hoc vien kiem tra nang luc theo lo trinh."
        description="Loc bai theo mini test, full test hoac practice set. Student lam bai free hoac bai duoc teacher assign, teacher quan ly de rieng va xem bai public cua admin."
      />

      {role === 'teacher' ? (
        <section className="grid gap-4 rounded-[2rem] border border-stroke bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:grid-cols-2">
          <article className="rounded-[1.5rem] bg-slate-50 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Admin published free tests</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{publicPublishedCount}</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">Teacher co the xem cac bai thi published ma admin push ra public cho tat ca hoc vien.</p>
          </article>
          <article className="rounded-[1.5rem] bg-slate-50 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Your mock tests</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{teacherOwnedCount}</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">Bao gom ca draft, published va archived do chinh teacher nay tao.</p>
          </article>
        </section>
      ) : null}

      <section className="grid gap-4 rounded-[2rem] border border-stroke bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Loai bai thi</span>
          <select
            className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none focus:border-teal-500"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as 'all' | 'mini-test' | 'full-test' | 'practice-set')
            }
          >
            {['all', 'mini-test', 'full-test', 'practice-set'].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Muc do</span>
          <select
            className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none focus:border-teal-500"
            value={levelFilter}
            onChange={(event) =>
              setLevelFilter(event.target.value as 'all' | 'beginner' | 'intermediate' | 'advanced')
            }
          >
            {['all', 'beginner', 'intermediate', 'advanced'].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Trang thai</span>
          <select
            className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none focus:border-teal-500"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as 'all' | 'published' | 'draft' | 'archived')
            }
          >
            {['all', 'published', 'draft', 'archived'].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </section>

      {mockTestsQuery.isPending ? <QueryLoadingState title="Dang tai danh sach bai thi..." /> : null}
      {mockTestsQuery.error ? (
        <QueryErrorState title="Khong tai duoc bai thi" description={getApiErrorMessage(mockTestsQuery.error)} />
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        {filteredTests.map((mockTest) => (
          <MockTestCard key={mockTest.id} mockTest={mockTest} />
        ))}
      </section>
    </div>
  );
}
