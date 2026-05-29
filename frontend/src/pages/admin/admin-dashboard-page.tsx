import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link } from 'react-router-dom';
import { MetricCard } from '../../components/common/metric-card';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { adminApi } from '../../lib/admin-api';
import { getApiErrorMessage } from '../../lib/api';
import { courseApi } from '../../lib/course-api';
import { formatCurrency } from '../../lib/format';
import { messageApi } from '../../lib/message-api';
import { postApi } from '../../lib/post-api';

export function AdminDashboardPage() {
  const statsQuery = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.stats,
  });
  const revenueQuery = useQuery({
    queryKey: ['admin', 'charts', 'revenue'],
    queryFn: adminApi.revenueChart,
  });
  const enrollmentChartQuery = useQuery({
    queryKey: ['admin', 'charts', 'enrollments'],
    queryFn: adminApi.enrollmentChart,
  });
  const coursesQuery = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: courseApi.manageMine,
  });
  const postsQuery = useQuery({
    queryKey: ['admin', 'posts'],
    queryFn: postApi.list,
  });
  const messagesQuery = useQuery({
    queryKey: ['admin', 'messages'],
    queryFn: messageApi.list,
  });

  const stats = statsQuery.data;
  const courses = coursesQuery.data ?? [];
  const posts = postsQuery.data ?? [];
  const messages = messagesQuery.data ?? [];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.35em] text-teal-700 uppercase">admin dashboard</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
              Control center cho van hanh noi dung, hoc vien va doanh thu.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">
              Dashboard nay da noi truc tiep `stats`, `revenue chart`, `enrollment chart`, courses, posts va inbox messages
              de admin nhin ra ngay khu vuc nao can xu ly.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              to="/admin/courses/create"
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Tao khoa hoc
            </Link>
            <Link
              to="/admin/mock-tests"
              className="rounded-2xl border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Quan ly mock tests
            </Link>
            <Link
              to="/admin/results"
              className="rounded-2xl border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Xem bang diem
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Tong users" value={String(stats?.users.total ?? '--')} hint={`${stats?.users.students ?? 0} hoc vien`} />
        <MetricCard
          label="Published courses"
          value={String(stats?.content.publishedCourses ?? '--')}
          hint={`${courses.filter((course) => !course.isPublished).length} draft`}
        />
        <MetricCard
          label="Tong enrollments"
          value={String(stats?.enrollments.total ?? '--')}
          hint={`${stats?.enrollments.completionRate ?? 0}% completion`}
        />
        <MetricCard
          label="Revenue"
          value={stats ? formatCurrency(stats.revenue.total, stats.revenue.currency) : '--'}
          hint={`${stats?.revenue.paidOrders ?? 0} paid orders`}
        />
      </section>

      {statsQuery.isPending || revenueQuery.isPending || enrollmentChartQuery.isPending ? (
        <QueryLoadingState title="Dang tai du lieu dashboard..." />
      ) : null}

      {statsQuery.error ? (
        <QueryErrorState title="Khong tai duoc stats" description={getApiErrorMessage(statsQuery.error)} />
      ) : null}
      {revenueQuery.error ? (
        <QueryErrorState title="Khong tai duoc revenue chart" description={getApiErrorMessage(revenueQuery.error)} />
      ) : null}
      {enrollmentChartQuery.error ? (
        <QueryErrorState
          title="Khong tai duoc enrollment chart"
          description={getApiErrorMessage(enrollmentChartQuery.error)}
        />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 uppercase">revenue trend</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Dong doanh thu 6 thang</h2>
            </div>
          </div>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueQuery.data ?? []} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={(value: number) => `${Math.round(value / 1000)}k`} />
                <Tooltip
                  formatter={(value) =>
                    typeof value === 'number' ? formatCurrency(value) : String(value ?? '')
                  }
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 uppercase">support inbox</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Tin nhan moi can xu ly</h2>

          <div className="mt-6 grid gap-4">
            {messages.slice(0, 4).map((message) => (
              <Link
                key={message.id}
                to="/admin/messages"
                className="rounded-2xl border border-stroke bg-slate-50 px-4 py-4 transition hover:border-teal-200 hover:bg-teal-50/60"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{message.subject}</p>
                  <span
                    className={[
                      'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]',
                      message.status === 'unread' ? 'bg-amber-100 text-amber-800' : message.status === 'replied' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700',
                    ].join(' ')}
                  >
                    {message.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{message.name} - {message.email}</p>
                <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-600">{message.content}</p>
              </Link>
            ))}

            {messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stroke px-4 py-6 text-sm text-slate-500">
                Chua co tin nhan moi.
              </div>
            ) : null}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 uppercase">enrollment chart</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Toc do dang ky va hoan thanh</h2>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentChartQuery.data ?? []} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="enrollments" fill="#0f172a" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completed" fill="#14b8a6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 uppercase">content pipeline</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Khoa hoc va bai viet gan day</h2>
            </div>
            <Link to="/admin/courses" className="text-sm font-semibold text-teal-700">
              Mo workspace
            </Link>
          </div>

          <div className="mt-6 grid gap-4">
            {courses.slice(0, 3).map((course) => (
              <div key={course.id} className="rounded-2xl border border-stroke bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{course.title}</p>
                  <span
                    className={[
                      'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]',
                      course.isPublished ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800',
                    ].join(' ')}
                  >
                    {course.isPublished ? 'published' : 'draft'}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">{course.shortDescription}</p>
              </div>
            ))}

            {posts.slice(0, 2).map((post) => (
              <div key={post.id} className="rounded-2xl border border-stroke bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{post.title}</p>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                    {post.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">{post.excerpt}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
