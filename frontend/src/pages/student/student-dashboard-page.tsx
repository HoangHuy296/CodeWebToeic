import { useAuth } from '../../app/providers/auth-provider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CourseProgressCard } from '../../components/common/course-progress-card';
import { MetricCard } from '../../components/common/metric-card';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { enrollmentApi, enrollmentQueryKeys } from '../../lib/enrollment-api';
import { learningApi, learningQueryKeys } from '../../lib/learning-api';
import { mockTestApi } from '../../lib/mock-test-api';
import { getApiErrorMessage } from '../../lib/api';

export function StudentDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const enrollmentsQuery = useQuery({
    queryKey: enrollmentQueryKeys.mine,
    queryFn: enrollmentApi.mine,
  });
  const mockTestsQuery = useQuery({
    queryKey: ['mock-tests', 'student-dashboard'],
    queryFn: mockTestApi.list,
  });

  const enrollments = enrollmentsQuery.data ?? [];
  const activeEnrollments = enrollments.filter((item) => item.status === 'active');
  const completedEnrollments = enrollments.filter((item) => item.status === 'completed');
  const averageProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, item) => sum + item.progressPercent, 0) / enrollments.length)
      : 0;

  const continueLearningEnrollments = enrollments
    .filter((item) => item.status !== 'cancelled')
    .sort((left, right) => right.progressPercent - left.progressPercent);

  if (continueLearningEnrollments.length > 0) {
    const primaryCourseId = continueLearningEnrollments[0].course.id;
    void queryClient.prefetchQuery({
      queryKey: learningQueryKeys.detail(primaryCourseId),
      queryFn: () => learningApi.detail(primaryCourseId),
      staleTime: 60_000,
    });
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="student dashboard"
        title={`Xin chao ${user?.fullName ?? 'hoc vien'}`}
        description="Dashboard hoc vien da ket noi du lieu that tu enrollments va mock tests. Muc tieu la de hoc vien biet ngay minh dang hoc gi, tien do den dau va bai thi nao nen lam tiep."
      />

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Tong khoa hoc" value={String(enrollments.length)} hint="Da dang ky" />
        <MetricCard label="Dang hoc" value={String(activeEnrollments.length)} hint="Can tiep tuc" />
        <MetricCard label="Hoan thanh" value={String(completedEnrollments.length)} hint="Da ket thuc" />
        <MetricCard label="Tien do TB" value={`${averageProgress}%`} hint="Tren toan bo khoa hoc" />
      </section>

      {enrollmentsQuery.isPending || mockTestsQuery.isPending ? (
        <QueryLoadingState title="Dang tai dashboard hoc vien..." />
      ) : null}
      {enrollmentsQuery.error ? (
        <QueryErrorState title="Khong tai duoc du lieu khoa hoc" description={getApiErrorMessage(enrollmentsQuery.error)} />
      ) : null}
      {mockTestsQuery.error ? (
        <QueryErrorState title="Khong tai duoc mock tests" description={getApiErrorMessage(mockTestsQuery.error)} />
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">continue learning</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Khoa hoc dang hoc</h2>
            </div>
            <Link to="/student/my-courses" className="text-sm font-semibold text-teal-700">
              Xem tat ca
            </Link>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {continueLearningEnrollments.slice(0, 2).map((enrollment) => (
              <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">mock tests</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Bai thi de xuat</h2>
          </div>

          <Link to="/student/results" className="text-sm font-semibold text-cyan-700">
            Xem bang diem
          </Link>

          <div className="grid gap-4">
            {(mockTestsQuery.data ?? []).slice(0, 3).map((mockTest) => (
              <Link
                key={mockTest.id}
                to={`/student/mock-tests/${mockTest.id}`}
                className="rounded-[1.6rem] border border-stroke bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                    {mockTest.type}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {mockTest.durationMinutes} phut
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-black tracking-tight text-slate-950">{mockTest.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{mockTest.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
