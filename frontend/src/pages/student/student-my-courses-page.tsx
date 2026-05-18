import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CourseProgressCard } from '../../components/common/course-progress-card';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { enrollmentApi, enrollmentQueryKeys } from '../../lib/enrollment-api';
import { getApiErrorMessage } from '../../lib/api';

export function StudentMyCoursesPage() {
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
        eyebrow="my courses"
        title="Tat ca khoa hoc ma ban da dang ky"
        description="Trang nay ket noi truc tiep voi enrollments API, hien progress, trang thai va duong dan tiep tuc hoc cho tung khoa hoc."
      />

      {enrollmentsQuery.isPending ? <QueryLoadingState title="Dang tai khoa hoc cua ban..." /> : null}
      {enrollmentsQuery.error ? (
        <QueryErrorState title="Khong tai duoc enrollments" description={getApiErrorMessage(enrollmentsQuery.error)} />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        {visibleEnrollments.map((enrollment) => (
          <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
        ))}
      </section>

      {!enrollmentsQuery.isPending && !enrollmentsQuery.error && visibleEnrollments.length === 0 ? (
        <section className="rounded-[1.8rem] border border-dashed border-stroke bg-white p-8 text-center shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Chua co khoa hoc</p>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
            Tai khoan nay chua enroll khoa hoc nao
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Sau khi dang ky thanh cong mot khoa hoc, trang nay se chi hien dung cac course ma ban da enroll.
          </p>
        </section>
      ) : null}
    </div>
  );
}
