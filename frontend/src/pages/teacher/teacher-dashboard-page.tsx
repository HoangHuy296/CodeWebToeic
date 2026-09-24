import { useQueries, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MetricCard } from '../../components/common/metric-card';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { courseApi } from '../../lib/course-api';
import { enrollmentApi } from '../../lib/enrollment-api';
import { getApiErrorMessage } from '../../lib/api';

export function TeacherDashboardPage() {
  const { t } = useTranslation('teacher');
  const { t: tCommon } = useTranslation('common');
  const managedCoursesQuery = useQuery({
    queryKey: ['teacher', 'courses', 'mine'],
    queryFn: courseApi.manageMine,
  });

  const courseEnrollmentsQueries = useQueries({
    queries: (managedCoursesQuery.data ?? []).map((course) => ({
      queryKey: ['teacher', 'course-enrollments', course.id],
      queryFn: () => enrollmentApi.byCourse(course.id),
      enabled: Boolean(managedCoursesQuery.data),
    })),
  });

  const isLoading =
    managedCoursesQuery.isPending || courseEnrollmentsQueries.some((query) => query.isPending);
  const enrollmentErrors = courseEnrollmentsQueries.find((query) => query.error)?.error;
  const allEnrollments = courseEnrollmentsQueries.flatMap((query) => query.data ?? []);
  const activeStudents = allEnrollments.filter((item) => item.status === 'active').length;
  const completedStudents = allEnrollments.filter((item) => item.status === 'completed').length;
  const totalStudents = allEnrollments.length;
  const totalLessons = (managedCoursesQuery.data ?? []).reduce((sum, course) => sum + course.lessonCount, 0);

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow={t('dashboard.eyebrow')}
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label={t('dashboard.managedCourses')} value={String((managedCoursesQuery.data ?? []).length)} hint={t('dashboard.managedHint')} />
        <MetricCard label={t('dashboard.totalEnrollments')} value={String(totalStudents)} hint={t('dashboard.enrollmentsHint')} />
        <MetricCard label={t('dashboard.activeEnrollments')} value={String(activeStudents)} hint={t('dashboard.activeHint')} />
        <MetricCard label={t('dashboard.totalLessons')} value={String(totalLessons)} hint={t('dashboard.lessonsHint')} />
      </section>

      {isLoading ? <QueryLoadingState title={t('dashboard.loading')} /> : null}
      {managedCoursesQuery.error ? (
        <QueryErrorState title={t('dashboard.coursesError')} description={getApiErrorMessage(managedCoursesQuery.error)} />
      ) : null}
      {enrollmentErrors ? (
        <QueryErrorState title={t('dashboard.studentsError')} description={getApiErrorMessage(enrollmentErrors)} />
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-stroke bg-white p-8 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">{t('courses.eyebrow')}</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{t('dashboard.recentCourses')}</h2>
            </div>
            <Link to="/teacher/courses" className="text-sm font-semibold text-teal-700">
              {tCommon('actions.viewAll')}
            </Link>
          </div>

          <div className="mt-6 grid gap-4">
            {(managedCoursesQuery.data ?? []).slice(0, 3).map((course) => (
              <div key={course.id} className="rounded-[1.5rem] bg-slate-50 px-5 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {course.category} · {tCommon(`levels.${course.level}`)}
                    </p>
                    <h3 className="mt-2 text-xl font-extrabold tracking-tight text-slate-950">{course.title}</h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                    {course.isPublished ? tCommon('statuses.published') : tCommon('statuses.draft')}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{course.shortDescription}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-stroke bg-white p-8 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">{t('dashboard.completion')}</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{t('students.title')}</h2>
          <Link to="/teacher/results" className="mt-4 inline-flex text-sm font-semibold text-cyan-700">
            {t('dashboard.viewResults')}
          </Link>
          <div className="mt-6 grid gap-4">
            <div className="rounded-[1.5rem] bg-slate-50 px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t('dashboard.activeEnrollments')}</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{activeStudents}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t('dashboard.completedEnrollments')}</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{completedStudents}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t('dashboard.completionRate')}</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                {totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0}%
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link
          to="/teacher/profile"
          className="rounded-[1.6rem] border border-stroke bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{t('dashboard.quickLinksEyebrow')}</p>
          <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">{t('dashboard.profileTitle')}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">{t('dashboard.profileDescription')}</p>
        </Link>

        <Link
          to="/teacher/courses"
          className="rounded-[1.6rem] border border-stroke bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{t('dashboard.quickLinksEyebrow')}</p>
          <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">{t('dashboard.coursesTitle')}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">{t('dashboard.coursesDescription')}</p>
        </Link>

        <Link
          to="/teacher/exercises/items"
          className="rounded-[1.6rem] border border-stroke bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{t('dashboard.quickLinksEyebrow')}</p>
          <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">{t('dashboard.exercisesTitle')}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">{t('dashboard.exercisesDescription')}</p>
        </Link>

        <Link
          to="/teacher/results"
          className="rounded-[1.6rem] border border-stroke bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{t('dashboard.quickLinksEyebrow')}</p>
          <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">{t('dashboard.resultsTitle')}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">{t('dashboard.resultsDescription')}</p>
        </Link>
      </section>
    </div>
  );
}
