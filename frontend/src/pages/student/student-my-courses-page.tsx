import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CourseProgressCard } from '../../components/common/course-progress-card';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { enrollmentApi, enrollmentQueryKeys } from '../../lib/enrollment-api';
import { getApiErrorMessage } from '../../lib/api';

export function StudentMyCoursesPage() {
  const { t } = useTranslation('student');
  const enrollmentsQuery = useQuery({
    queryKey: enrollmentQueryKeys.mine,
    queryFn: enrollmentApi.mine,
  });
  const visibleEnrollments = useMemo(() => {
    const seenCourseIds = new Set<string>();

    return (enrollmentsQuery.data ?? []).filter((enrollment) => {
      if (!enrollment.course.id || !enrollment.course.title) {
        return false;
      }

      if (enrollment.status === 'cancelled') {
        return false;
      }

      if (seenCourseIds.has(enrollment.course.id)) {
        return false;
      }

      seenCourseIds.add(enrollment.course.id);
      return true;
    });
  }, [enrollmentsQuery.data]);

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow={t('myCourses.eyebrow')}
        title={t('myCourses.title')}
        description={t('myCourses.description')}
      />

      {enrollmentsQuery.isPending ? <QueryLoadingState title={t('myCourses.loading')} /> : null}
      {enrollmentsQuery.error ? (
        <QueryErrorState title={t('myCourses.loadError')} description={getApiErrorMessage(enrollmentsQuery.error)} />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        {visibleEnrollments.map((enrollment) => (
          <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
        ))}
      </section>

      {!enrollmentsQuery.isPending && !enrollmentsQuery.error && visibleEnrollments.length === 0 ? (
        <section className="rounded-[1.8rem] border border-dashed border-stroke bg-white p-8 text-center shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{t('myCourses.empty')}</p>
          <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">{t('myCourses.emptyTitle')}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">{t('myCourses.emptyDescription')}</p>
        </section>
      ) : null}
    </div>
  );
}
