import { useQueries, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MetricCard } from '../../components/common/metric-card';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { courseApi } from '../../lib/course-api';
import { enrollmentApi } from '../../lib/enrollment-api';
import { getApiErrorMessage } from '../../lib/api';

export function TeacherDashboardPage() {
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
        eyebrow="teacher dashboard"
        title="Bang dieu khien giang vien voi so lieu khoa hoc va hoc vien that."
        description="Teacher dashboard nay tong hop khoa hoc dang quan ly, hoc vien dang theo hoc va muc do hoan thanh de giang vien biet nen tac dong vao dau."
      />

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Khoa hoc quan ly" value={String((managedCoursesQuery.data ?? []).length)} hint="Owned courses" />
        <MetricCard label="Tong hoc vien" value={String(totalStudents)} hint="Tu enrollments theo course" />
        <MetricCard label="Dang hoc" value={String(activeStudents)} hint="Status active" />
        <MetricCard label="Lessons da dong goi" value={String(totalLessons)} hint="Tong lesson cua teacher" />
      </section>

      {isLoading ? <QueryLoadingState title="Dang tai dashboard giang vien..." /> : null}
      {managedCoursesQuery.error ? (
        <QueryErrorState title="Khong tai duoc danh sach khoa hoc" description={getApiErrorMessage(managedCoursesQuery.error)} />
      ) : null}
      {enrollmentErrors ? (
        <QueryErrorState title="Khong tai duoc roster hoc vien" description={getApiErrorMessage(enrollmentErrors)} />
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-stroke bg-white p-8 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">courses</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Khoa hoc gan day</h2>
            </div>
            <Link to="/teacher/courses" className="text-sm font-semibold text-teal-700">
              Xem tat ca
            </Link>
          </div>

          <div className="mt-6 grid gap-4">
            {(managedCoursesQuery.data ?? []).slice(0, 3).map((course) => (
              <div key={course.id} className="rounded-[1.5rem] bg-slate-50 px-5 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {course.category} · {course.level}
                    </p>
                    <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">{course.title}</h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{course.shortDescription}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-stroke bg-white p-8 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">student health</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Tien do hoc vien</h2>
          <Link to="/teacher/results" className="mt-4 inline-flex text-sm font-semibold text-cyan-700">
            Xem bang diem bai lam
          </Link>
          <div className="mt-6 grid gap-4">
            <div className="rounded-[1.5rem] bg-slate-50 px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Dang hoc</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{activeStudents}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Da hoan thanh</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{completedStudents}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Ti le hoan thanh</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">teacher tools</p>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Ho so giang vien</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            CRUD thong tin giang vien, doi mat khau, email va so dien thoai ngay trong workspace.
          </p>
        </Link>

        <Link
          to="/teacher/courses"
          className="rounded-[1.6rem] border border-stroke bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">teacher tools</p>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Quan ly khoa hoc</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Mo danh sach khoa hoc, vao lesson list workspace va theo doi review status cua tung khoa hoc.
          </p>
        </Link>

        <Link
          to="/teacher/exercises/items"
          className="rounded-[1.6rem] border border-stroke bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">teacher tools</p>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Bai tap ca nhan hoa</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Tao va quan ly bai tap on tap rieng cho hoc vien, tach khoi luong luyen thi de phat trien ca nhan hoa lau dai.
          </p>
        </Link>

        <Link
          to="/teacher/results"
          className="rounded-[1.6rem] border border-stroke bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">teacher tools</p>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Ket qua bai lam</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Xem diem va bai nop cua hoc vien tren cac bai luyen thi va bai tap do ban tao.
          </p>
        </Link>
      </section>
    </div>
  );
}
