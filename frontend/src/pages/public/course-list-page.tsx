import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../app/providers/auth-provider';
import { CourseCard } from '../../components/common/course-card';
import { PageHero } from '../../components/common/page-hero';
import { PaginationControls } from '../../components/common/pagination-controls';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { courseApi } from '../../lib/course-api';
import { getApiErrorMessage } from '../../lib/api';
import { enrollmentApi, enrollmentQueryKeys } from '../../lib/enrollment-api';

export function CourseListPage() {
  const { role, isAuthenticated } = useAuth();
  const pageSize = 6;
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesQuery = useQuery({
    queryKey: ['courses', 'public-list'],
    queryFn: courseApi.list,
  });
  const enrollmentsQuery = useQuery({
    queryKey: enrollmentQueryKeys.mine,
    queryFn: enrollmentApi.mine,
    enabled: isAuthenticated && role === 'student',
  });

  const categorySummaries = useMemo(() => {
    if (!coursesQuery.data) {
      return [];
    }

    return Array.from(
      coursesQuery.data.reduce<Map<string, { category: string; count: number }>>((accumulator, course) => {
        const current = accumulator.get(course.category) ?? {
          category: course.category,
          count: 0,
        };

        current.count += 1;
        accumulator.set(course.category, current);
        return accumulator;
      }, new Map()).values(),
    );
  }, [coursesQuery.data]);

  const filteredCourses = useMemo(() => {
    if (!coursesQuery.data) {
      return [];
    }

    return coursesQuery.data.filter((course) => {
      const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
      const matchesLevel = activeLevel === 'all' || course.level === activeLevel;
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        course.title.toLowerCase().includes(normalizedSearch) ||
        course.shortDescription.toLowerCase().includes(normalizedSearch) ||
        course.category.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [activeCategory, activeLevel, coursesQuery.data, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeLevel, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const paginatedCourses = useMemo(
    () => filteredCourses.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredCourses],
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const enrolledCourseIds = useMemo(
    () => new Set((enrollmentsQuery.data ?? []).map((enrollment) => enrollment.course.id)),
    [enrollmentsQuery.data],
  );

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="courses"
        title="Chon khoa hoc TOEIC, IELTS theo muc tieu, trinh do va uu dai dang mo."
        description="Loc nhanh theo category, level va tu khoa de tim dung lo trinh: TOEIC foundation, sprint score boost, IELTS speaking, writing hoac practice lab."
      />

      {coursesQuery.isPending ? <QueryLoadingState title="Dang tai danh sach khoa hoc..." /> : null}
      {coursesQuery.error ? (
        <QueryErrorState title="Khong tai duoc khoa hoc" description={getApiErrorMessage(coursesQuery.error)} />
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[1.8rem] border border-stroke bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">search and filter</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Tim khoa hoc theo category, level va tu khoa</h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
                setActiveLevel('all');
              }}
              className="rounded-2xl border border-stroke bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Reset bo loc
            </button>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.7fr_0.7fr]">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Tim nhanh theo ten khoa hoc, category
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Vi du: TOEIC, IELTS, 650+, writing..."
                className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Category
              <select
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value)}
                className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400"
              >
                <option value="all">Tat ca category</option>
                {categorySummaries.map((summary) => (
                  <option key={summary.category} value={summary.category}>
                    {summary.category} ({summary.count})
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Level
              <select
                value={activeLevel}
                onChange={(event) => setActiveLevel(event.target.value as 'all' | 'beginner' | 'intermediate' | 'advanced')}
                className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400"
              >
                <option value="all">Tat ca level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-teal-50 px-3 py-2 font-semibold text-teal-700">
              {filteredCourses.length} ket qua
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-2 font-semibold">
              Category: {activeCategory === 'all' ? 'Tat ca' : activeCategory}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-2 font-semibold">
              Level: {activeLevel === 'all' ? 'Tat ca' : activeLevel}
            </span>
          </div>
        </article>

        <article className="rounded-[1.8rem] border border-stroke bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(15,118,110,0.9),rgba(249,115,22,0.78))] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-100">deal spotlight</p>
          <h3 className="mt-3 text-2xl font-black tracking-tight">Chon dung khoa hoc theo target score va uu dai hien tai.</h3>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[1.3rem] border border-white/10 bg-white/8 px-4 py-4">
              <p className="text-sm font-semibold text-cyan-100">Category dang chon</p>
              <p className="mt-2 text-lg font-black">{activeCategory === 'all' ? 'Tat ca category' : activeCategory}</p>
            </div>
            <div className="rounded-[1.3rem] border border-white/10 bg-white/8 px-4 py-4">
              <p className="text-sm font-semibold text-cyan-100">Goi y chot nhanh</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Card khoa hoc hien ro discount, lesson count va muc tieu hoc de hoc vien ra quyet dinh nhanh hon.
              </p>
            </div>
          </div>
        </article>
      </section>

      {filteredCourses.length > 0 ? (
        <section className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">course results</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Khoa hoc dang mo ban</h2>
          </div>
          <p className="text-sm font-semibold text-slate-500">Moi card giu day du thong tin nhung uu tien diem so, level va promotion.</p>
        </section>
      ) : null}

      {coursesQuery.data ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {paginatedCourses.map((course) => (
            <CourseCard key={course.id} course={course} isEnrolled={enrolledCourseIds.has(course.id)} />
          ))}
        </section>
      ) : null}

      {coursesQuery.data && filteredCourses.length > 0 ? (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredCourses.length}
          itemLabel="khoa hoc"
          onPageChange={setCurrentPage}
        />
      ) : null}

      {coursesQuery.data && filteredCourses.length === 0 ? (
        <section className="rounded-[1.8rem] border border-dashed border-stroke bg-white p-8 text-center shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Khong co du lieu</p>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
            Chua co khoa hoc trung voi bo loc hien tai
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Thu doi category, level hoac tim theo tu khoa khac de xem them lo trinh phu hop.
          </p>
        </section>
      ) : null}
    </div>
  );
}
