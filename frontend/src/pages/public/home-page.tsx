import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

export function HomePage() {
  const { t } = useTranslation('public');
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

  const featureCards = [
    { title: t('home.feature1Title'), text: t('home.feature1Text') },
    { title: t('home.feature2Title'), text: t('home.feature2Text') },
    { title: t('home.feature3Title'), text: t('home.feature3Text') },
  ];

  const whyItems = [t('home.why1'), t('home.why2'), t('home.why3')];

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow={t('home.heroEyebrow')}
        title={t('home.heroTitle')}
        description={t('home.heroDescription')}
      />

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="brand-panel rounded-[1.5rem] p-6 sm:p-8 lg:p-10">
          <p className="panel-eyebrow text-xs font-semibold tracking-[0.3em] uppercase">{t('home.panelEyebrow')}</p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight">{t('home.panelTitle')}</h2>
          <p className="panel-muted mt-4 max-w-2xl text-sm leading-7">
            {t('home.panelDescription')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/courses" className="btn-paper px-5 py-3 text-sm">{t('home.viewCourses')}</Link>
            <Link to="/mock-test" className="btn-on-panel px-5 py-3 text-sm">{t('home.practiceNow')}</Link>
          </div>
        </article>

        <div className="grid gap-4">
          {featureCards.map((card, index) => (
            <article key={card.title} className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-sm font-extrabold text-teal-700">
                0{index + 1}
              </span>
              <h3 className="mt-4 text-xl font-extrabold tracking-tight text-slate-950">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: t('home.statFeaturedCourses'), value: featuredCourses.length },
          { label: t('home.statPublicMockTests'), value: featuredMockTests.length },
          { label: t('home.statStudyGuides'), value: featuredPosts.length },
          { label: t('home.statWorkspaceRoles'), value: '3' },
        ].map((item) => (
          <article key={item.label} className="rounded-[1.6rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{item.value}</p>
          </article>
        ))}
      </section>

      {coursesQuery.isPending || mockTestsQuery.isPending ? (
        <QueryLoadingState title={t('home.loadingHome')} />
      ) : null}
      {coursesQuery.error ? (
        <QueryErrorState title={t('home.errorCourses')} description={getApiErrorMessage(coursesQuery.error)} />
      ) : null}
      {mockTestsQuery.error ? (
        <QueryErrorState title={t('home.errorMockTests')} description={getApiErrorMessage(mockTestsQuery.error)} />
      ) : null}
      {postsQuery.error ? (
        <QueryErrorState title={t('home.errorPosts')} description={getApiErrorMessage(postsQuery.error)} />
      ) : null}

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">{t('home.featuredCoursesEyebrow')}</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{t('home.featuredCoursesTitle')}</h2>
          </div>
          <Link to="/courses" className="text-sm font-semibold text-teal-700">
            {t('home.viewAll')}
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
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">{t('home.whyEyebrow')}</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{t('home.whyTitle')}</h2>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {whyItems.map((item) => (
            <article key={item} className="rounded-[1.6rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold leading-7 text-slate-700">{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">{t('home.mockTestEyebrow')}</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{t('home.mockTestTitle')}</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {featuredMockTests.map((mockTest) => (
            <MockTestCard key={mockTest.id} mockTest={mockTest} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">{t('home.studyGuideEyebrow')}</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{t('home.studyGuideTitle')}</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {featuredPosts.map((article) => (
            <article key={article.slug} className="overflow-hidden rounded-[1.8rem] border border-stroke bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
              <img src={article.coverImage} alt={article.title} className="h-44 w-full object-cover" />
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">{article.tags[0] ?? t('home.blogFallbackTag')}</p>
                <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">{article.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{article.excerpt}</p>
                <Link to={`/blog/${article.slug}`} className="mt-5 inline-flex text-sm font-semibold text-teal-700">
                  {t('home.readMore')}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
