import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { getApiErrorMessage } from '../../lib/api';
import { mockTestApi } from '../../lib/mock-test-api';

interface WorkspaceMockTestsPageProps {
  workspaceRole: 'admin' | 'teacher';
}

export function WorkspaceMockTestsPage({ workspaceRole }: WorkspaceMockTestsPageProps) {
  const [search, setSearch] = useState('');
  const listQuery = useQuery({
    queryKey: [workspaceRole, 'mock-test', 'manage'],
    queryFn: () => mockTestApi.manageMine(),
  });

  const mockTests = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (listQuery.data ?? []).filter((mockTest) => {
      if (!keyword) {
        return true;
      }

      return [mockTest.title, mockTest.description, mockTest.type, mockTest.level, mockTest.status]
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    });
  }, [listQuery.data, search]);

  const createPath = `/${workspaceRole}/mock-tests/create`;
  const editBasePath = `/${workspaceRole}/mock-tests`;
  const eyebrow = workspaceRole === 'admin' ? 'admin mock tests' : 'teacher mock tests';
  const title =
    workspaceRole === 'admin'
      ? 'Quan ly ngan hang mock tests va dieu huong sang workspace chinh sua rieng.'
      : 'Teacher co the tao mock test rieng, gan vao khoa hoc cua minh va theo doi danh sach de thi.';

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">{title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">
              Click vao mot bai thi bat ky de mo tab chinh sua rieng. Form tao bai thi moi cung duoc tach thanh mot route
              rieng de builder co toan bo khung lam viec.
            </p>
          </div>

          <Link
            to={createPath}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Tao bai thi moi
          </Link>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Danh sach de thi</h2>
            <p className="mt-2 text-sm text-slate-600">
              {workspaceRole === 'admin'
                ? 'Admin nhin thay tat ca de thi trong he thong.'
                : 'Teacher chi nhin thay de thi do minh tao va quan ly cho hoc vien cua minh.'}
            </p>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tim theo title, level, type, status cua de thi"
            className="w-full rounded-2xl border border-stroke bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-400 lg:max-w-sm"
          />
        </div>

        {listQuery.isPending ? (
          <div className="mt-6">
            <QueryLoadingState title="Dang tai danh sach mock tests..." />
          </div>
        ) : null}
        {listQuery.error ? (
          <div className="mt-6">
            <QueryErrorState title="Khong tai duoc mock tests" description={getApiErrorMessage(listQuery.error)} />
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {mockTests.map((mockTest) => (
            <article
              key={mockTest.id}
              className="rounded-[1.5rem] border border-stroke bg-[linear-gradient(135deg,rgba(248,250,252,0.96),rgba(255,255,255,0.94))] p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                  {mockTest.status}
                </span>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">
                  {mockTest.type}
                </span>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-700">
                  {mockTest.level}
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950">{mockTest.title}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{mockTest.description}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">So cau</p>
                  <p className="mt-2 text-lg font-black text-slate-950">{mockTest.questionCount}</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Thoi gian</p>
                  <p className="mt-2 text-lg font-black text-slate-950">{mockTest.durationMinutes} phut</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assigned courses</p>
                  <p className="mt-2 text-lg font-black text-slate-950">{mockTest.assignedCourseIds.length}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to={`${editBasePath}/${mockTest.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-stroke bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Mo tab chinh sua
                </Link>
              </div>
            </article>
          ))}
        </div>

        {!listQuery.isPending && !listQuery.error && mockTests.length === 0 ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-stroke bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
            Chua co mock test nao khop bo loc hien tai.
          </div>
        ) : null}
      </section>
    </div>
  );
}
