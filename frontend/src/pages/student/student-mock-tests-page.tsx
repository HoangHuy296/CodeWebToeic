import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MockTestCard } from '../../components/common/mock-test-card';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { getApiErrorMessage } from '../../lib/api';
import { mockTestApi } from '../../lib/mock-test-api';

export function StudentMockTestsPage() {
  const [levelFilter, setLevelFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const mockTestsQuery = useQuery({
    queryKey: ['mock-tests', 'student'],
    queryFn: mockTestApi.list,
  });

  const filteredTests = useMemo(() => {
    return (mockTestsQuery.data ?? []).filter((item) => {
      return levelFilter === 'all' || item.level === levelFilter;
    });
  }, [levelFilter, mockTestsQuery.data]);

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="student mock tests"
        title="Kho bai thi de ban vao luyen ngay"
        description="Trang nay ket noi truc tiep voi mock tests API, giup hoc vien loc de theo muc do va bat dau session lam bai tu student workspace."
      />

      <section className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
        <label className="grid max-w-xs gap-2">
          <span className="text-sm font-semibold text-slate-700">Loc theo muc do</span>
          <select
            value={levelFilter}
            onChange={(event) =>
              setLevelFilter(event.target.value as 'all' | 'beginner' | 'intermediate' | 'advanced')
            }
            className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none focus:border-teal-500"
          >
            {['all', 'beginner', 'intermediate', 'advanced'].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </section>

      {mockTestsQuery.isPending ? <QueryLoadingState title="Dang tai danh sach bai thi..." /> : null}
      {mockTestsQuery.error ? (
        <QueryErrorState title="Khong tai duoc mock tests" description={getApiErrorMessage(mockTestsQuery.error)} />
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        {filteredTests.map((mockTest) => (
          <MockTestCard key={mockTest.id} mockTest={mockTest} />
        ))}
      </section>
    </div>
  );
}
