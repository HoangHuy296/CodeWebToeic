import { useQuery } from '@tanstack/react-query';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { adminApi } from '../../lib/admin-api';
import { getApiErrorMessage } from '../../lib/api';
import { formatCurrency } from '../../lib/format';

const pieColors = ['#0f766e', '#0f172a', '#f59e0b'];

export function AdminSettingsPage() {
  const statsQuery = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.stats,
  });
  const revenueQuery = useQuery({
    queryKey: ['admin', 'charts', 'revenue'],
    queryFn: adminApi.revenueChart,
  });

  const contentData = statsQuery.data
    ? [
        { name: 'Courses', value: statsQuery.data.content.publishedCourses },
        { name: 'Mock tests', value: statsQuery.data.content.publishedMockTests },
        { name: 'Posts', value: statsQuery.data.content.publishedPosts },
      ]
    : [];

  const lastRevenuePoint = revenueQuery.data?.[revenueQuery.data.length - 1];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold tracking-[0.35em] text-teal-700 uppercase">admin settings</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Operational settings va runtime overview cho MVP.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">
          MVP chua co API luu cau hinh dong. Vi vay trang nay tap trung vao runtime config, suc khoe content pipeline va cac nguyen tac van hanh
          de admin co mot diem quan sat that su huu dung.
        </p>
      </section>

      {statsQuery.isPending || revenueQuery.isPending ? <QueryLoadingState title="Dang tai operational settings..." /> : null}
      {statsQuery.error ? (
        <QueryErrorState title="Khong tai duoc stats" description={getApiErrorMessage(statsQuery.error)} />
      ) : null}
      {revenueQuery.error ? (
        <QueryErrorState title="Khong tai duoc revenue data" description={getApiErrorMessage(revenueQuery.error)} />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 uppercase">runtime</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Thong so van hanh frontend</h2>

          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl border border-stroke bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">API base URL</p>
              <p className="mt-2 break-all text-sm font-semibold text-slate-950">{import.meta.env.VITE_API_URL}</p>
            </div>
            <div className="rounded-2xl border border-stroke bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Latest revenue bucket</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {lastRevenuePoint ? `${lastRevenuePoint.month}: ${formatCurrency(lastRevenuePoint.revenue)}` : 'Chua co doanh thu'}
              </p>
            </div>
            <div className="rounded-2xl border border-stroke bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Completion rate</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {statsQuery.data?.enrollments.completionRate ?? 0}% tren tong enrollments
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 uppercase">content mix</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Ty trong noi dung dang publish</h2>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={contentData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                  {contentData.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: 'Media strategy',
            description:
              'MVP dang luu `videoUrl`, `videoProvider`, `duration`, `thumbnail` thay vi binary. Day la ranh gioi ky thuat dung de nang cap Cloudinary/S3/Bunny/Vimeo private sau nay.',
          },
          {
            title: 'Auth discipline',
            description:
              'Admin shell dang dung JWT access token tu auth provider. Mọi trang CRUD phase 13 deu di qua API client co Authorization header tu dong.',
          },
          {
            title: 'Ops checklist',
            description:
              'Khi deploy, can cau hinh `CLIENT_URL`, `VITE_API_URL`, MongoDB production, JWT secrets manh va media provider keys trong `.env`.',
          },
        ].map((item) => (
          <article key={item.title} className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            <h3 className="text-xl font-black tracking-tight text-slate-950">{item.title}</h3>
            <p className="mt-3 text-sm leading-8 text-slate-600">{item.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
