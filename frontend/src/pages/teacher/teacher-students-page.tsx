import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { courseApi } from '../../lib/course-api';
import { enrollmentApi } from '../../lib/enrollment-api';
import { getApiErrorMessage } from '../../lib/api';
import { ProgressBar } from '../../components/common/progress-bar';

export function TeacherStudentsPage() {
  const coursesQuery = useQuery({
    queryKey: ['teacher', 'courses', 'mine'],
    queryFn: courseApi.manageMine,
  });

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const activeCourseId = selectedCourseId || coursesQuery.data?.[0]?.id || '';
  const activeCourse = useMemo(
    () => (coursesQuery.data ?? []).find((course) => course.id === activeCourseId) ?? null,
    [activeCourseId, coursesQuery.data],
  );

  const enrollmentsQuery = useQuery({
    queryKey: ['teacher', 'course-enrollments', activeCourseId],
    enabled: Boolean(activeCourseId),
    queryFn: () => enrollmentApi.byCourse(activeCourseId),
  });

  const filteredEnrollments = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();

    return (enrollmentsQuery.data ?? []).filter((enrollment) => {
      if (!normalizedKeyword) {
        return true;
      }

      const fullName = enrollment.student.fullName?.toLowerCase() ?? '';
      const email = enrollment.student.email?.toLowerCase() ?? '';

      return fullName.includes(normalizedKeyword) || email.includes(normalizedKeyword);
    });
  }, [enrollmentsQuery.data, searchKeyword]);

  const rosterStats = useMemo(() => {
    const enrollments = filteredEnrollments;
    const total = enrollments.length;
    const completed = enrollments.filter((item) => item.status === 'completed').length;
    const active = enrollments.filter((item) => item.status === 'active').length;
    const averageProgress =
      total > 0 ? Math.round(enrollments.reduce((sum, item) => sum + item.progressPercent, 0) / total) : 0;

    return {
      total,
      completed,
      active,
      averageProgress,
    };
  }, [filteredEnrollments]);

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="teacher students"
        title="Theo doi hoc vien theo tung khoa hoc ma khong can scroll qua nhieu."
        description="Teacher co the chon khoa hoc, loc nhanh hoc vien va xem progress, completed lessons, ngay enroll trong mot roster compact hon."
      />

      <section className="rounded-[1.8rem] border border-stroke bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Chon khoa hoc</span>
            <select
              value={activeCourseId}
              onChange={(event) => setSelectedCourseId(event.target.value)}
              className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none focus:border-violet-500"
            >
              {(coursesQuery.data ?? []).map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Tim hoc vien trong khoa hoc</span>
            <input
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="Nhap ten hoac email hoc vien..."
              className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none transition focus:border-violet-500"
            />
          </label>
        </div>
      </section>

      {coursesQuery.isPending || enrollmentsQuery.isPending ? <QueryLoadingState title="Dang tai student roster..." /> : null}
      {coursesQuery.error ? (
        <QueryErrorState title="Khong tai duoc khoa hoc" description={getApiErrorMessage(coursesQuery.error)} />
      ) : null}
      {enrollmentsQuery.error ? (
        <QueryErrorState title="Khong tai duoc hoc vien" description={getApiErrorMessage(enrollmentsQuery.error)} />
      ) : null}

      {activeCourse ? (
        <section className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-700">active course</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{activeCourse.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{activeCourse.shortDescription}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                <span>{activeCourse.category}</span>
                <span>{activeCourse.level}</span>
                <span>{activeCourse.lessonCount} lessons</span>
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
              {[
                { label: 'Tong hoc vien', value: rosterStats.total },
                { label: 'Dang hoc', value: rosterStats.active },
                { label: 'Da hoan thanh', value: rosterStats.completed },
                { label: 'Tien do TB', value: `${rosterStats.averageProgress}%` },
              ].map((item) => (
                <article key={item.label} className="rounded-[1.5rem] border border-stroke bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{item.value}</p>
                </article>
              ))}
            </div>
          </div>

          <section className="rounded-[1.8rem] border border-stroke bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_8rem_8rem] gap-4 border-b border-stroke px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>Hoc vien</span>
              <span>Tien do</span>
              <span>Lessons</span>
              <span>Enroll</span>
            </div>

            <div className="divide-y divide-[rgba(148,163,184,0.14)]">
              {filteredEnrollments.length > 0 ? (
                filteredEnrollments.map((enrollment) => (
                  <article
                    key={enrollment.id}
                    className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_8rem_8rem] items-center gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-black tracking-tight text-slate-950">
                        {enrollment.student.fullName ?? 'Hoc vien'}
                      </p>
                      <p className="truncate text-sm text-slate-500">{enrollment.student.email ?? 'No email'}</p>
                    </div>

                    <div className="min-w-0">
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-600">
                        <span className="truncate">{enrollment.status}</span>
                        <span>{enrollment.progressPercent}%</span>
                      </div>
                      <ProgressBar value={enrollment.progressPercent} />
                    </div>

                    <div>
                      <p className="text-sm font-black tracking-tight text-slate-950">
                        {enrollment.completedLessonIds.length}/{activeCourse.lessonCount}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">completed</p>
                    </div>

                    <div>
                      <p className="text-sm font-black tracking-tight text-slate-950">
                        {new Date(enrollment.enrolledAt).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">enrolled</p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Khong co du lieu</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Chua co hoc vien nao khop voi bo loc hien tai cho khoa hoc nay.
                  </p>
                </div>
              )}
            </div>
          </section>
        </section>
      ) : null}
    </div>
  );
}
