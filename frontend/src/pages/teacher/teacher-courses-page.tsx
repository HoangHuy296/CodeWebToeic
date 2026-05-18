import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { getApiErrorMessage } from '../../lib/api';
import { courseApi, type CreateCoursePayload } from '../../lib/course-api';
import { formatCurrency, parseCommaList, parseLineList } from '../../lib/format';
import type { Course } from '../../types/course';

interface TeacherCourseDraft {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  level: CreateCoursePayload['level'];
  price: string;
  salePrice: string;
  thumbnail: string;
  introVideoUrl: string;
  introVideoProvider: CreateCoursePayload['introVideo']['videoProvider'];
  introDuration: string;
  introThumbnail: string;
  tagsText: string;
  benefitsText: string;
}

const initialDraft: TeacherCourseDraft = {
  title: '',
  slug: '',
  shortDescription: '',
  description: '',
  category: 'TOEIC',
  level: 'beginner',
  price: '',
  salePrice: '',
  thumbnail: '',
  introVideoUrl: '',
  introVideoProvider: 'youtube',
  introDuration: '0',
  introThumbnail: '',
  tagsText: '',
  benefitsText: '',
};

function resolveReviewStatus(course: Course): Course['reviewStatus'] {
  return course.reviewStatus ?? 'pending_review';
}

function getCourseSurfaceClasses(course: Course, isFocused: boolean) {
  if (course.isPublished) {
    return [
      'border-emerald-200 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(209,250,229,0.92))]',
      isFocused ? 'ring-2 ring-emerald-300' : '',
    ].join(' ');
  }

  const reviewStatus = resolveReviewStatus(course);

  if (reviewStatus === 'rejected') {
    return [
      'border-rose-200 bg-[linear-gradient(135deg,rgba(254,242,242,0.96),rgba(255,228,230,0.92))]',
      isFocused ? 'ring-2 ring-rose-200' : '',
    ].join(' ');
  }

  return [
    'border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,0.96),rgba(254,243,199,0.9))]',
    isFocused ? 'ring-2 ring-amber-200' : '',
  ].join(' ');
}

export function TeacherCoursesPage() {
  const queryClient = useQueryClient();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [draft, setDraft] = useState<TeacherCourseDraft>(initialDraft);
  const coursesQuery = useQuery({
    queryKey: ['teacher', 'courses', 'mine'],
    queryFn: courseApi.manageMine,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      courseApi.create({
        title: draft.title,
        ...(draft.slug.trim() ? { slug: draft.slug.trim() } : {}),
        shortDescription: draft.shortDescription,
        description: draft.description,
        category: draft.category,
        level: draft.level,
        price: Number(draft.price),
        ...(draft.salePrice.trim() ? { salePrice: Number(draft.salePrice) } : {}),
        thumbnail: draft.thumbnail,
        introVideo: {
          videoUrl: draft.introVideoUrl,
          videoProvider: draft.introVideoProvider,
          duration: Number(draft.introDuration) || 0,
          ...(draft.introThumbnail.trim() ? { thumbnail: draft.introThumbnail.trim() } : {}),
        },
        tags: parseCommaList(draft.tagsText),
        benefits: parseLineList(draft.benefitsText),
        isPublished: true,
      }),
    onSuccess: async () => {
      setDraft(initialDraft);
      setIsComposerOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['teacher', 'courses', 'mine'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] }),
      ]);
    },
  });

  const grouped = useMemo(() => {
    const courses = coursesQuery.data ?? [];
    return {
      draft: courses.filter((course) => !course.isPublished),
      published: courses.filter((course) => course.isPublished),
    };
  }, [coursesQuery.data]);

  const isCreateDisabled =
    !draft.title.trim() ||
    !draft.shortDescription.trim() ||
    !draft.description.trim() ||
    !draft.category.trim() ||
    !draft.price.trim() ||
    !draft.thumbnail.trim() ||
    !draft.introVideoUrl.trim();

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="teacher courses"
        title="Khong gian dong goi khoa hoc va gui admin phe duyet."
        description="Teacher co the tao khoa hoc moi, theo doi noi dung course dang draft tren public detail, va chi mo Lesson List khi khoa hoc da duoc publish."
      />

      <section className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">teacher submission workflow</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Tao khoa hoc moi cho admin review</h2>
            <p className="mt-4 text-sm leading-8 text-slate-600">
              Sau khi teacher tao khoa hoc, backend se tu dong ep trang thai ve draft. Ban draft chi dung de theo doi noi dung khoa hoc. Chi khi admin publish, teacher moi mo duoc Lesson List de quan ly bai giang.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsComposerOpen((current) => !current)}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {isComposerOpen ? 'Dong form tao khoa hoc' : 'Tao khoa hoc moi'}
          </button>
        </div>

        {isComposerOpen ? (
          <form
            className="mt-6 grid gap-4 rounded-[1.6rem] border border-stroke bg-slate-50 p-5"
            onSubmit={(event) => {
              event.preventDefault();
              createMutation.mutate();
            }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Trang thai tao moi</p>
              <p className="mt-2 text-sm font-semibold text-amber-700">
                Draft bat buoc. Teacher khong the publish truc tiep.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Ten khoa hoc" className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400" />
              <input value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))} placeholder="Slug tuy chinh" className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <input value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} placeholder="Category" className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400" />
              <select value={draft.level} onChange={(event) => setDraft((current) => ({ ...current, level: event.target.value as TeacherCourseDraft['level'] }))} className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <input value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))} placeholder="Gia goc" className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400" />
            </div>

            <input value={draft.salePrice} onChange={(event) => setDraft((current) => ({ ...current, salePrice: event.target.value }))} placeholder="Gia uu dai" className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400" />

            <textarea rows={3} value={draft.shortDescription} onChange={(event) => setDraft((current) => ({ ...current, shortDescription: event.target.value }))} placeholder="Mo ta ngan" className="rounded-[1.5rem] border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400" />
            <textarea rows={5} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Mo ta chi tiet" className="rounded-[1.5rem] border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400" />

            <div className="grid gap-4 md:grid-cols-2">
              <input value={draft.thumbnail} onChange={(event) => setDraft((current) => ({ ...current, thumbnail: event.target.value }))} placeholder="Thumbnail URL" className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400" />
              <input value={draft.introVideoUrl} onChange={(event) => setDraft((current) => ({ ...current, introVideoUrl: event.target.value }))} placeholder="Intro video URL" className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <select value={draft.introVideoProvider} onChange={(event) => setDraft((current) => ({ ...current, introVideoProvider: event.target.value as TeacherCourseDraft['introVideoProvider'] }))} className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400">
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="cloudinary">Cloudinary</option>
                <option value="bunny">Bunny</option>
                <option value="s3">S3</option>
                <option value="other">Other</option>
              </select>
              <input value={draft.introDuration} onChange={(event) => setDraft((current) => ({ ...current, introDuration: event.target.value }))} placeholder="Duration giay" className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400" />
              <input value={draft.introThumbnail} onChange={(event) => setDraft((current) => ({ ...current, introThumbnail: event.target.value }))} placeholder="Intro thumbnail URL" className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <textarea rows={4} value={draft.tagsText} onChange={(event) => setDraft((current) => ({ ...current, tagsText: event.target.value }))} placeholder="Tags, cach nhau boi dau phay" className="rounded-[1.5rem] border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400" />
              <textarea rows={4} value={draft.benefitsText} onChange={(event) => setDraft((current) => ({ ...current, benefitsText: event.target.value }))} placeholder="Moi dong la 1 benefit" className="rounded-[1.5rem] border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400" />
            </div>

            {createMutation.error ? <QueryErrorState title="Khong tao duoc khoa hoc" description={getApiErrorMessage(createMutation.error)} /> : null}

            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => { setDraft(initialDraft); setIsComposerOpen(false); }} className="rounded-2xl border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">Huy</button>
              <button type="submit" disabled={createMutation.isPending || isCreateDisabled} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                {createMutation.isPending ? 'Dang gui admin review...' : 'Tao draft va gui admin review'}
              </button>
            </div>
          </form>
        ) : null}
      </section>

      {coursesQuery.isPending ? <QueryLoadingState title="Dang tai khoa hoc cua giang vien..." /> : null}
      {coursesQuery.error ? <QueryErrorState title="Khong tai duoc khoa hoc" description={getApiErrorMessage(coursesQuery.error)} /> : null}

      <section className="grid gap-6 xl:grid-cols-2">
        {[...grouped.draft, ...grouped.published].map((course) => {
          const reviewStatus = resolveReviewStatus(course);
          const reviewNote = course.reviewNote ?? '';

          return (
            <article
              key={course.id}
              className={[
                'rounded-[1.6rem] border p-4 shadow-[0_12px_36px_rgba(15,23,42,0.06)]',
                getCourseSurfaceClasses(course, false),
              ].join(' ')}
            >
              <div className="flex gap-4">
                <div className="h-24 w-32 shrink-0 overflow-hidden rounded-[1.2rem] bg-white/70 sm:h-28 sm:w-40">
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={['rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]', course.isPublished ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'].join(' ')}>
                      {course.isPublished ? 'published' : 'draft'}
                    </span>
                    <span className="rounded-full bg-white/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700">{course.level}</span>
                    <span className="rounded-full bg-white/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700">{course.lessonCount} lessons</span>
                  </div>

                  <h2 className="mt-3 line-clamp-2 text-xl font-black tracking-tight text-slate-950">{course.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{course.shortDescription}</p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span>{course.category}</span>
                    <span>{formatCurrency(course.salePrice ?? course.price)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[1.2rem] border border-white/70 bg-white/65 px-4 py-3 text-sm leading-6 text-slate-700">
                {course.isPublished
                  ? 'Khoa hoc da duoc admin publish. Teacher co the theo doi version dang live tren public page va CRUD lesson trong workspace rieng.'
                  : reviewStatus === 'changes_requested'
                    ? `Admin da yeu cau chinh sua.${reviewNote ? ` Ghi chu: ${reviewNote}` : ''}`
                    : reviewStatus === 'rejected'
                      ? `Khoa hoc da bi tu choi.${reviewNote ? ` Ghi chu: ${reviewNote}` : ''}`
                      : 'Khoa hoc dang o draft. Admin se review, co the chinh sua, tu choi hoac publish tu khu admin. Teacher van co the dong goi lesson trong workspace rieng.'}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  to={`/teacher/courses/${course.slug}/lessons`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/80 bg-white/80 px-4 py-2.5 text-center text-sm font-semibold text-slate-900 transition hover:bg-white"
                >
                  Lesson List
                </Link>
                <Link to={`/courses/${course.slug}`} className="rounded-2xl border border-white/80 bg-white/80 px-4 py-2.5 text-center text-sm font-semibold text-slate-900 transition hover:bg-white">
                  Xem trang public
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
