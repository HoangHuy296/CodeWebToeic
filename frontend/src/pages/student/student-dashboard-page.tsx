import { useAuth } from '../../app/providers/auth-provider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CourseProgressCard } from '../../components/common/course-progress-card';
import { MetricCard } from '../../components/common/metric-card';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { enrollmentApi, enrollmentQueryKeys } from '../../lib/enrollment-api';
import { learningApi, learningQueryKeys } from '../../lib/learning-api';
import { mockTestApi } from '../../lib/mock-test-api';
import { getApiErrorMessage } from '../../lib/api';

export function StudentDashboardPage() {
  const { t } = useTranslation('student');
  const { t: tCommon } = useTranslation('common');
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
        eyebrow={t('dashboard.eyebrow')}
        title={t('dashboard.title', { name: user?.fullName ?? t('dashboard.fallbackName') })}
        description={t('dashboard.description')}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label={t('dashboard.totalCourses')} value={String(enrollments.length)} hint={t('dashboard.enrolledHint')} />
        <MetricCard label={t('dashboard.activeCourses')} value={String(activeEnrollments.length)} hint={t('dashboard.activeHint')} />
        <MetricCard label={t('dashboard.completedCourses')} value={String(completedEnrollments.length)} hint={t('dashboard.completedHint')} />
        <MetricCard label={t('dashboard.averageProgress')} value={`${averageProgress}%`} hint={t('dashboard.progressHint')} />
      </section>

      {enrollmentsQuery.isPending || mockTestsQuery.isPending ? (
        <QueryLoadingState title={t('dashboard.loading')} />
      ) : null}
      {enrollmentsQuery.error ? (
        <QueryErrorState title={t('dashboard.coursesError')} description={getApiErrorMessage(enrollmentsQuery.error)} />
      ) : null}
      {mockTestsQuery.error ? (
        <QueryErrorState title={t('dashboard.testsError')} description={getApiErrorMessage(mockTestsQuery.error)} />
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">{t('dashboard.continueLearning')}</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{t('dashboard.currentCourses')}</h2>
            </div>
            <Link to="/student/my-courses" className="text-sm font-semibold text-teal-700">
              {tCommon('actions.viewAll')}
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
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">{t('mockTests.eyebrow')}</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{t('dashboard.recommendedTests')}</h2>
          </div>

          <Link to="/student/results" className="text-sm font-semibold text-cyan-700">
            {t('dashboard.viewScores')}
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
                    {tCommon(`testTypes.${mockTest.type}` as const)}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {tCommon('counts.minutes', { count: mockTest.durationMinutes })}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-extrabold tracking-tight text-slate-950">{mockTest.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{mockTest.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
