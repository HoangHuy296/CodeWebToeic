import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/providers/auth-provider';
import { CourseCard } from '../../components/common/course-card';
import { MockTestCard } from '../../components/common/mock-test-card';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { courseApi } from '../../lib/course-api';
import { getApiErrorMessage } from '../../lib/api';
import { enrollmentApi, enrollmentQueryKeys } from '../../lib/enrollment-api';
import { mockTestApi } from '../../lib/mock-test-api';
import { postApi } from '../../lib/post-api';

const featureCards = [
  {
    title: 'Learning path ro muc tieu',
    text: 'Moi khoa hoc duoc chia theo muc diem, ky nang va checkpoint de hoc vien biet minh dang hoc gi va vi sao.',
  },
  {
    title: 'Mock test gan voi lo trinh',
    text: 'Hoc vien co the lam mini test, practice set hoac bai free de theo doi nang luc TOEIC / IELTS theo tung giai doan.',
  },
  {
    title: 'CRM cho van hanh lop hoc',
    text: 'Admin va giang vien quan ly hoc vien, course, message va review noi dung trong cung mot he thong.',
  },
];

export function HomePage() {
  const { role, isAuthenticated } = useAuth();
  const coursesQuery = useQuery({
    queryKey: ['courses', 'home'],
    queryFn: courseApi.list,
  });
  const mockTestsQuery = useQuery({
    queryKey: ['mock-tests', 'home'],
    queryFn: mockTestApi.list,
  });
  const enrollmentsQuery = useQuery({
    queryKey: enrollmentQueryKeys.mine,
    queryFn: enrollmentApi.mine,
    enabled: isAuthenticated && role === 'student',
  });
  const postsQuery = useQuery({
    queryKey: ['posts', 'home'],
    queryFn: postApi.list,
  });

  const featuredCourses = useMemo(() => (coursesQuery.data ?? []).slice(0, 3), [coursesQuery.data]);
  const featuredMockTests = useMemo(() => (mockTestsQuery.data ?? []).slice(0, 2), [mockTestsQuery.data]);
  const featuredPosts = useMemo(() => (postsQuery.data ?? []).slice(0, 3), [postsQuery.data]);
  const enrolledCourseIds = useMemo(
    () => new Set((enrollmentsQuery.data ?? []).map((enrollment) => enrollment.course.id)),
    [enrollmentsQuery.data],
  );

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="IVYTS 1997"
        title="English learning CRM cho TOEIC, IELTS va lop hoc online co the do luong."
        description="IVYTS 1997 ket hop khoa hoc dong goi, mock test, learning progress va inbox noi bo de hoc vien hoc ro lo trinh, giang vien theo doi tien do, admin van hanh gon."
      />

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-white/20 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,118,110,0.9),rgba(29,78,216,0.86))] p-8 text-white shadow-[0_26px_70px_rgba(15,23,42,0.2)] lg:p-10">
          <p className="text-xs font-semibold tracking-[0.35em] text-cyan-100 uppercase">english academy crm</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight">Hoc vien thay duoc diem den. Giang vien thay duoc tien do.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Tu landing page den trang hoc, he thong tap trung vao nhung viec quan trong: chon khoa hoc dung trinh do, lam bai thi dung thoi diem, va nhan feedback dung nguoi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/courses" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950">Xem khoa hoc</Link>
            <Link to="/mock-test" className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white">Luyen thi ngay</Link>
          </div>
        </article>

        <div className="grid gap-4">
          {featureCards.map((card, index) => (
            <article key={card.title} className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-sm font-black text-teal-700">
                0{index + 1}
              </span>
              <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-950">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Khoa hoc noi bat', value: featuredCourses.length },
          { label: 'Mock tests cong khai', value: featuredMockTests.length },
          { label: 'Study guides', value: featuredPosts.length },
          { label: 'Workspace roles', value: '3' },
        ].map((item) => (
          <article key={item.label} className="rounded-[1.6rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{item.value}</p>
          </article>
        ))}
      </section>

      {coursesQuery.isPending || mockTestsQuery.isPending ? (
        <QueryLoadingState title="Dang tai du lieu homepage..." />
      ) : null}
      {coursesQuery.error ? (
        <QueryErrorState title="Khong tai duoc du lieu khoa hoc" description={getApiErrorMessage(coursesQuery.error)} />
      ) : null}
      {mockTestsQuery.error ? (
        <QueryErrorState title="Khong tai duoc du lieu bai thi" description={getApiErrorMessage(mockTestsQuery.error)} />
      ) : null}
      {postsQuery.error ? (
        <QueryErrorState title="Khong tai duoc du lieu bai viet" description={getApiErrorMessage(postsQuery.error)} />
      ) : null}

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">featured courses</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Khoa hoc noi bat</h2>
          </div>
          <Link to="/courses" className="text-sm font-semibold text-teal-700">
            Xem tat ca
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} isEnrolled={enrolledCourseIds.has(course.id)} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">why ivyts 1997</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Mot he thong cho hoc va van hanh</h2>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            'Course, lesson, mock test va progress duoc gom thanh mot hanh trinh hoc tieng Anh ro rang.',
            'Teacher co workspace rieng de theo doi hoc vien, dong goi lesson va tao bai test cho lop minh.',
            'Admin quan ly review noi dung, nguoi dung, message va chi so van hanh trong cung mot dashboard.',
          ].map((item) => (
            <article key={item} className="rounded-[1.6rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold leading-7 text-slate-700">{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">mock tests</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Bai thi giup hoc vien biet minh dang o dau</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {featuredMockTests.map((mockTest) => (
            <MockTestCard key={mockTest.id} mockTest={mockTest} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">study guides</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Huong dan hoc TOEIC va IELTS co he thong</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {featuredPosts.map((article) => (
            <article key={article.slug} className="overflow-hidden rounded-[1.8rem] border border-stroke bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
              <img src={article.coverImage} alt={article.title} className="h-44 w-full object-cover" />
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">{article.tags[0] ?? 'Blog'}</p>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{article.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{article.excerpt}</p>
                <Link to={`/blog/${article.slug}`} className="mt-5 inline-flex text-sm font-semibold text-teal-700">
                  Doc tiep
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
