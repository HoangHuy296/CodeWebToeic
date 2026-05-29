import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { getApiErrorMessage } from '../../lib/api';
import { exerciseSessionApi } from '../../lib/exercise-session-api';

interface WorkspaceExerciseItemsPageProps {
  workspaceRole: 'admin' | 'teacher';
}

export function WorkspaceExerciseItemsPage({ workspaceRole }: WorkspaceExerciseItemsPageProps) {
  const [search, setSearch] = useState('');
  const listQuery = useQuery({
    queryKey: [workspaceRole, 'exercise', 'manage'],
    queryFn: () => exerciseSessionApi.manageMine(),
  });

  const exerciseItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (listQuery.data ?? []).filter((item) => {
      if (!keyword) {
        return true;
      }

      return [
        item.title,
        item.description,
        item.type,
        item.level,
        item.status,
        item.exerciseTopicSlug ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    });
  }, [listQuery.data, search]);

  const createPath = `/${workspaceRole}/exercises/items/create`;
  const editBasePath = `/${workspaceRole}/exercises/items`;
  const eyebrow = workspaceRole === 'admin' ? 'admin exercises' : 'teacher exercises';
  const title =
    workspaceRole === 'admin'
      ? 'Quan ly ngan hang bai tap on tap de mo rong lo trinh luyen tap cho hoc vien.'
      : 'Teacher co the tao bai tap rieng, ca nhan hoa cho hoc vien va tach khoi nhom luyen thi.';

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-700">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">{title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">
              Khu nay danh rieng cho bai tap on tap. Exercise items di theo huong luyen tap va ca nhan hoa,
              khong dung chung workflow quan ly voi mock-test nua.
            </p>
          </div>

          <Link
            to={createPath}
            className="rounded-2xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Tao bai tap moi
          </Link>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Danh sach bai tap</h2>
            <p className="mt-2 text-sm text-slate-600">
              {workspaceRole === 'admin'
                ? 'Admin nhin thay toan bo bai tap on tap trong he thong.'
                : 'Teacher chi nhin thay bai tap do minh tao de phuc vu hoc vien cua minh.'}
            </p>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tim theo title, level, type, status, chu de cua bai tap"
            className="w-full rounded-2xl border border-stroke bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-400 lg:max-w-sm"
          />
        </div>

        {listQuery.isPending ? (
          <div className="mt-6">
            <QueryLoadingState title="Dang tai danh sach bai tap..." />
          </div>
        ) : null}
        {listQuery.error ? (
          <div className="mt-6">
            <QueryErrorState title="Khong tai duoc bai tap" description={getApiErrorMessage(listQuery.error)} />
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {exerciseItems.map((item) => (
            <article
              key={item.id}
              className="rounded-[1.5rem] border border-stroke bg-[linear-gradient(135deg,rgba(255,251,235,0.95),rgba(255,255,255,0.98))] p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                  {item.status}
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                  {item.type}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {item.level}
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950">{item.title}</h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Chu de: {item.exerciseTopicSlug || 'chua gan'}
              </p>
              <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{item.description}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">So cau</p>
                  <p className="mt-2 text-lg font-black text-slate-950">{item.questionCount}</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Thoi gian</p>
                  <p className="mt-2 text-lg font-black text-slate-950">{item.durationMinutes} phut</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assigned courses</p>
                  <p className="mt-2 text-lg font-black text-slate-950">{item.assignedCourseIds.length}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to={`${editBasePath}/${item.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-50"
                >
                  Mo tab bai tap
                </Link>
              </div>
            </article>
          ))}
        </div>

        {!listQuery.isPending && !listQuery.error && exerciseItems.length === 0 ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-stroke bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
            Chua co bai tap nao khop bo loc hien tai.
          </div>
        ) : null}
      </section>
    </div>
  );
}
