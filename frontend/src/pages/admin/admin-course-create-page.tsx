import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { QueryErrorState } from '../../components/common/query-state';
import type { CreateCoursePayload, CreateLessonPayload } from '../../lib/course-api';
import { courseApi } from '../../lib/course-api';
import { getApiErrorMessage, getApiFieldErrors } from '../../lib/api';
import { parseCommaList, parseLineList } from '../../lib/format';

interface LessonDraft extends CreateLessonPayload {
  materialsText: string;
}

function createLessonDraft(order: number): LessonDraft {
  return {
    title: '',
    description: '',
    content: '',
    order,
    isPreview: order === 1,
    video: {
      videoUrl: '',
      videoProvider: 'youtube',
      duration: 0,
      thumbnail: '',
    },
    materials: [],
    materialsText: '',
  };
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function AdminCourseCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('TOEIC');
  const [level, setLevel] = useState<CreateCoursePayload['level']>('beginner');
  const [price, setPrice] = useState('0');
  const [salePrice, setSalePrice] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [introVideoProvider, setIntroVideoProvider] = useState<CreateCoursePayload['introVideo']['videoProvider']>('youtube');
  const [introDuration, setIntroDuration] = useState('0');
  const [introThumbnail, setIntroThumbnail] = useState('');
  const [materialsText, setMaterialsText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [lessons, setLessons] = useState<LessonDraft[]>([createLessonDraft(1), createLessonDraft(2)]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const clientErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (title.trim().length < 3) {
      errors.title = 'Ten khoa hoc phai co it nhat 3 ky tu.';
    }

    if (slug.trim() && slug.trim().length < 3) {
      errors.slug = 'Slug phai co it nhat 3 ky tu.';
    }

    if (shortDescription.trim().length < 10) {
      errors.shortDescription = 'Mo ta ngan phai co it nhat 10 ky tu.';
    }

    if (description.trim().length < 20) {
      errors.description = 'Mo ta chi tiet phai co it nhat 20 ky tu.';
    }

    if (category.trim().length < 2) {
      errors.category = 'Category la bat buoc.';
    }

    if (Number.isNaN(Number(price)) || Number(price) < 0) {
      errors.price = 'Gia goc phai la so hop le.';
    }

    if (salePrice.trim() && (Number.isNaN(Number(salePrice)) || Number(salePrice) < 0)) {
      errors.salePrice = 'Gia uu dai phai la so hop le.';
    }

    if (!isValidHttpUrl(thumbnail.trim())) {
      errors.thumbnail = 'Thumbnail URL phai la link hop le.';
    }

    if (!isValidHttpUrl(introVideoUrl.trim())) {
      errors['introVideo.videoUrl'] = 'Intro video URL phai la link hop le.';
    }

    if (introThumbnail.trim() && !isValidHttpUrl(introThumbnail.trim())) {
      errors['introVideo.thumbnail'] = 'Thumbnail video phai la link hop le.';
    }

    if (Number.isNaN(Number(introDuration)) || Number(introDuration) < 0) {
      errors['introVideo.duration'] = 'Duration phai la so khong am.';
    }

    parseLineList(materialsText).forEach((line, index) => {
      if (!isValidHttpUrl(line)) {
        errors[`materials.${index}.fileUrl`] = `Materials URL dong ${index + 1} khong hop le.`;
      }
    });

    lessons.forEach((lesson, index) => {
      const hasAnyContent =
        lesson.title.trim() ||
        lesson.description.trim() ||
        lesson.content?.trim() ||
        lesson.video.videoUrl.trim() ||
        lesson.materialsText.trim();

      if (!hasAnyContent) {
        return;
      }

      if (lesson.title.trim().length < 3) {
        errors[`lessons.${index}.title`] = `Lesson ${index + 1}: tieu de phai co it nhat 3 ky tu.`;
      }

      if (lesson.slug?.trim() && lesson.slug.trim().length < 3) {
        errors[`lessons.${index}.slug`] = `Lesson ${index + 1}: slug phai co it nhat 3 ky tu.`;
      }

      if (lesson.description.trim().length < 10) {
        errors[`lessons.${index}.description`] = `Lesson ${index + 1}: mo ta phai co it nhat 10 ky tu.`;
      }

      if (!isValidHttpUrl(lesson.video.videoUrl.trim())) {
        errors[`lessons.${index}.video.videoUrl`] = `Lesson ${index + 1}: video URL phai hop le.`;
      }

      if (lesson.video.thumbnail?.trim() && !isValidHttpUrl(lesson.video.thumbnail.trim())) {
        errors[`lessons.${index}.video.thumbnail`] = `Lesson ${index + 1}: thumbnail URL phai hop le.`;
      }

      if (Number.isNaN(Number(lesson.video.duration ?? 0)) || Number(lesson.video.duration ?? 0) < 0) {
        errors[`lessons.${index}.video.duration`] = `Lesson ${index + 1}: duration phai la so khong am.`;
      }

      parseLineList(lesson.materialsText).forEach((line, materialIndex) => {
        if (!isValidHttpUrl(line)) {
          errors[`lessons.${index}.materials.${materialIndex}.fileUrl`] =
            `Lesson ${index + 1}: materials URL dong ${materialIndex + 1} khong hop le.`;
        }
      });
    });

    return errors;
  }, [
    benefitsText,
    category,
    description,
    introDuration,
    introThumbnail,
    introVideoUrl,
    lessons,
    materialsText,
    price,
    salePrice,
    shortDescription,
    slug,
    thumbnail,
    title,
  ]);

  const mergedFieldErrors = {
    ...clientErrors,
    ...fieldErrors,
  };
  const hasBlockingErrors = Object.keys(clientErrors).length > 0;

  const getInputClassName = (field: string) =>
    [
      'rounded-2xl border bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400',
      mergedFieldErrors[field] ? 'border-rose-300 bg-rose-50/60' : 'border-stroke',
    ].join(' ');

  const getTextareaClassName = (field: string) =>
    [
      'rounded-[1.5rem] border bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400',
      mergedFieldErrors[field] ? 'border-rose-300 bg-rose-50/60' : 'border-stroke',
    ].join(' ');

  const createMutation = useMutation({
    mutationFn: async () => {
      const coursePayload: CreateCoursePayload = {
        title,
        ...(slug.trim() ? { slug: slug.trim() } : {}),
        shortDescription,
        description,
        category,
        level,
        price: Number(price),
        ...(salePrice.trim() ? { salePrice: Number(salePrice) } : {}),
        thumbnail,
        introVideo: {
          videoUrl: introVideoUrl,
          videoProvider: introVideoProvider,
          duration: Number(introDuration) || 0,
          ...(introThumbnail.trim() ? { thumbnail: introThumbnail.trim() } : {}),
        },
        materials: parseLineList(materialsText).map((line, index) => ({
          title: `Tai lieu ${index + 1}`,
          fileUrl: line,
          fileType: 'document',
        })),
        tags: parseCommaList(tagsText),
        benefits: parseLineList(benefitsText),
        isPublished,
      };

      const course = await courseApi.create(coursePayload);

      for (const lesson of lessons.filter((item) => item.title.trim() && item.video.videoUrl.trim())) {
        await courseApi.createLesson(course.id, {
          title: lesson.title,
          ...(lesson.slug?.trim() ? { slug: lesson.slug.trim() } : {}),
          description: lesson.description,
          content: lesson.content,
          order: lesson.order,
          isPreview: lesson.isPreview,
          video: {
            videoUrl: lesson.video.videoUrl,
            videoProvider: lesson.video.videoProvider,
            duration: lesson.video.duration,
            ...(lesson.video.thumbnail?.trim() ? { thumbnail: lesson.video.thumbnail.trim() } : {}),
          },
          materials: parseLineList(lesson.materialsText).map((line, index) => ({
            title: `Lesson material ${index + 1}`,
            fileUrl: line,
            fileType: 'document',
          })),
        });
      }

      return course;
    },
    onSuccess: (course) => {
      navigate(`/courses/${course.slug}`);
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error));
      setFieldErrors(getApiFieldErrors(error));
    },
  });

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold tracking-[0.35em] text-teal-700 uppercase">course packaging</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Tao khoa hoc va dong goi lesson ngay trong mot quy trinh.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">
          Form nay tao `course` truoc, sau do push tung `lesson` thong qua API rieng. Cac field video chi luu metadata/url de
          san sang nang cap sang Cloudinary, S3, Bunny hoac Vimeo private o phase sau.
        </p>
      </section>

      <form
        className="grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          setFieldErrors({});
          setFormError(null);

          if (hasBlockingErrors) {
            setFieldErrors(clientErrors);
            setFormError('Vui long sua cac truong dang bao loi truoc khi tao khoa hoc.');
            return;
          }

          createMutation.mutate();
        }}
      >
        <section className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Thong tin khoa hoc</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Ten khoa hoc
              <input value={title} onChange={(event) => setTitle(event.target.value)} className={getInputClassName('title')} />
              {mergedFieldErrors.title ? <span className="text-xs font-semibold text-rose-600">{mergedFieldErrors.title}</span> : null}
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Slug tuy chinh
              <input value={slug} onChange={(event) => setSlug(event.target.value)} className={getInputClassName('slug')} />
              {mergedFieldErrors.slug ? <span className="text-xs font-semibold text-rose-600">{mergedFieldErrors.slug}</span> : null}
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Category
              <input value={category} onChange={(event) => setCategory(event.target.value)} className={getInputClassName('category')} />
              {mergedFieldErrors.category ? <span className="text-xs font-semibold text-rose-600">{mergedFieldErrors.category}</span> : null}
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Level
              <select value={level} onChange={(event) => setLevel(event.target.value as CreateCoursePayload['level'])} className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Publish ngay
              <span className="flex h-full items-center rounded-2xl border border-stroke bg-slate-50 px-4 py-3">
                <input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} className="size-4" />
              </span>
            </label>
          </div>

          <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
            Mo ta ngan
            <textarea rows={3} value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} className={getTextareaClassName('shortDescription')} />
            {mergedFieldErrors.shortDescription ? <span className="text-xs font-semibold text-rose-600">{mergedFieldErrors.shortDescription}</span> : null}
          </label>

          <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
            Mo ta chi tiet
            <textarea rows={6} value={description} onChange={(event) => setDescription(event.target.value)} className={getTextareaClassName('description')} />
            {mergedFieldErrors.description ? <span className="text-xs font-semibold text-rose-600">{mergedFieldErrors.description}</span> : null}
          </label>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Gia goc
              <input value={price} onChange={(event) => setPrice(event.target.value)} className={getInputClassName('price')} />
              {mergedFieldErrors.price ? <span className="text-xs font-semibold text-rose-600">{mergedFieldErrors.price}</span> : null}
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Gia uu dai
              <input value={salePrice} onChange={(event) => setSalePrice(event.target.value)} className={getInputClassName('salePrice')} />
              {mergedFieldErrors.salePrice ? <span className="text-xs font-semibold text-rose-600">{mergedFieldErrors.salePrice}</span> : null}
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Thumbnail URL
              <input value={thumbnail} onChange={(event) => setThumbnail(event.target.value)} className={getInputClassName('thumbnail')} />
              {mergedFieldErrors.thumbnail ? <span className="text-xs font-semibold text-rose-600">{mergedFieldErrors.thumbnail}</span> : null}
            </label>
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Intro video va tai nguyen</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Intro video URL
              <input value={introVideoUrl} onChange={(event) => setIntroVideoUrl(event.target.value)} className={getInputClassName('introVideo.videoUrl')} />
              {mergedFieldErrors['introVideo.videoUrl'] ? <span className="text-xs font-semibold text-rose-600">{mergedFieldErrors['introVideo.videoUrl']}</span> : null}
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Video provider
              <select value={introVideoProvider} onChange={(event) => setIntroVideoProvider(event.target.value as CreateCoursePayload['introVideo']['videoProvider'])} className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400">
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="cloudinary">Cloudinary</option>
                <option value="bunny">Bunny</option>
                <option value="s3">S3</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Duration giay
              <input value={introDuration} onChange={(event) => setIntroDuration(event.target.value)} className={getInputClassName('introVideo.duration')} />
              {mergedFieldErrors['introVideo.duration'] ? <span className="text-xs font-semibold text-rose-600">{mergedFieldErrors['introVideo.duration']}</span> : null}
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Thumbnail video
              <input value={introThumbnail} onChange={(event) => setIntroThumbnail(event.target.value)} className={getInputClassName('introVideo.thumbnail')} />
              {mergedFieldErrors['introVideo.thumbnail'] ? <span className="text-xs font-semibold text-rose-600">{mergedFieldErrors['introVideo.thumbnail']}</span> : null}
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Materials URL
              <textarea rows={5} value={materialsText} onChange={(event) => setMaterialsText(event.target.value)} placeholder="Moi dong la 1 URL tai lieu" className={getTextareaClassName('materials.0.fileUrl')} />
              {Object.entries(mergedFieldErrors).filter(([field]) => field.startsWith('materials.')).map(([field, message]) => (
                <span key={field} className="text-xs font-semibold text-rose-600">{message}</span>
              ))}
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Tags
              <textarea rows={5} value={tagsText} onChange={(event) => setTagsText(event.target.value)} placeholder="toeic, listening, band 650+" className="rounded-[1.5rem] border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Benefits
              <textarea rows={5} value={benefitsText} onChange={(event) => setBenefitsText(event.target.value)} placeholder="Moi dong la 1 loi ich hoc vien nhan duoc" className="rounded-[1.5rem] border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400" />
            </label>
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Lesson packaging</h2>
              <p className="mt-2 text-sm text-slate-600">Moi lesson co video, materials va co the danh dau preview.</p>
            </div>
            <button
              type="button"
              onClick={() => setLessons((current) => [...current, createLessonDraft(current.length + 1)])}
              className="rounded-2xl border border-stroke bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Them lesson
            </button>
          </div>

          <div className="mt-6 grid gap-5">
            {lessons.map((lesson, index) => (
              <article key={`lesson-${index}`} className="rounded-[1.5rem] border border-stroke bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-black tracking-tight text-slate-950">Lesson {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (lessons.length > 1) {
                        setLessons((current) => current.filter((_, lessonIndex) => lessonIndex !== index).map((item, itemIndex) => ({ ...item, order: itemIndex + 1 })));
                      }
                    }}
                    className="text-sm font-semibold text-rose-600"
                  >
                    Xoa lesson
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <input
                    value={lesson.title}
                    onChange={(event) => setLessons((current) => current.map((item, lessonIndex) => lessonIndex === index ? { ...item, title: event.target.value } : item))}
                    placeholder="Tieu de lesson"
                    className={getInputClassName(`lessons.${index}.title`).replace('bg-slate-50', 'bg-white')}
                  />
                  <input
                    value={lesson.slug ?? ''}
                    onChange={(event) => setLessons((current) => current.map((item, lessonIndex) => lessonIndex === index ? { ...item, slug: event.target.value } : item))}
                    placeholder="Slug lesson"
                    className={getInputClassName(`lessons.${index}.slug`).replace('bg-slate-50', 'bg-white')}
                  />
                </div>
                {(mergedFieldErrors[`lessons.${index}.title`] || mergedFieldErrors[`lessons.${index}.slug`]) ? (
                  <div className="mt-2 grid gap-1">
                    {mergedFieldErrors[`lessons.${index}.title`] ? <span className="text-xs font-semibold text-rose-600">{mergedFieldErrors[`lessons.${index}.title`]}</span> : null}
                    {mergedFieldErrors[`lessons.${index}.slug`] ? <span className="text-xs font-semibold text-rose-600">{mergedFieldErrors[`lessons.${index}.slug`]}</span> : null}
                  </div>
                ) : null}

                <textarea
                  rows={3}
                  value={lesson.description}
                  onChange={(event) => setLessons((current) => current.map((item, lessonIndex) => lessonIndex === index ? { ...item, description: event.target.value } : item))}
                  placeholder="Mo ta lesson"
                  className={`mt-4 w-full ${getTextareaClassName(`lessons.${index}.description`).replace('bg-slate-50', 'bg-white')}`}
                />
                {mergedFieldErrors[`lessons.${index}.description`] ? <p className="mt-2 text-xs font-semibold text-rose-600">{mergedFieldErrors[`lessons.${index}.description`]}</p> : null}

                <textarea
                  rows={5}
                  value={lesson.content}
                  onChange={(event) => setLessons((current) => current.map((item, lessonIndex) => lessonIndex === index ? { ...item, content: event.target.value } : item))}
                  placeholder="Noi dung hoc, note hoac transcript"
                  className="mt-4 w-full rounded-[1.5rem] border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400"
                />

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <input
                    value={lesson.video.videoUrl}
                    onChange={(event) => setLessons((current) => current.map((item, lessonIndex) => lessonIndex === index ? { ...item, video: { ...item.video, videoUrl: event.target.value } } : item))}
                    placeholder="Video URL"
                    className={getInputClassName(`lessons.${index}.video.videoUrl`).replace('bg-slate-50', 'bg-white')}
                  />
                  <select
                    value={lesson.video.videoProvider}
                    onChange={(event) => setLessons((current) => current.map((item, lessonIndex) => lessonIndex === index ? { ...item, video: { ...item.video, videoProvider: event.target.value as LessonDraft['video']['videoProvider'] } } : item))}
                    className="rounded-2xl border border-stroke bg-white px-4 py-3 outline-none focus:border-teal-400"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="cloudinary">Cloudinary</option>
                    <option value="bunny">Bunny</option>
                    <option value="s3">S3</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    value={lesson.video.duration ?? 0}
                    onChange={(event) => setLessons((current) => current.map((item, lessonIndex) => lessonIndex === index ? { ...item, video: { ...item.video, duration: Number(event.target.value) || 0 } } : item))}
                    placeholder="Duration"
                    className={getInputClassName(`lessons.${index}.video.duration`).replace('bg-slate-50', 'bg-white')}
                  />
                  <input
                    value={lesson.video.thumbnail ?? ''}
                    onChange={(event) => setLessons((current) => current.map((item, lessonIndex) => lessonIndex === index ? { ...item, video: { ...item.video, thumbnail: event.target.value } } : item))}
                    placeholder="Thumbnail URL"
                    className={getInputClassName(`lessons.${index}.video.thumbnail`).replace('bg-slate-50', 'bg-white')}
                  />
                </div>
                {Object.entries(mergedFieldErrors).filter(([field]) => field.startsWith(`lessons.${index}.video.`)).length > 0 ? (
                  <div className="mt-2 grid gap-1">
                    {Object.entries(mergedFieldErrors)
                      .filter(([field]) => field.startsWith(`lessons.${index}.video.`))
                      .map(([field, message]) => (
                        <span key={field} className="text-xs font-semibold text-rose-600">{message}</span>
                      ))}
                  </div>
                ) : null}

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <textarea
                    rows={4}
                    value={lesson.materialsText}
                    onChange={(event) => setLessons((current) => current.map((item, lessonIndex) => lessonIndex === index ? { ...item, materialsText: event.target.value } : item))}
                    placeholder="Moi dong la 1 URL tai lieu lesson"
                    className={getTextareaClassName(`lessons.${index}.materials.0.fileUrl`).replace('bg-slate-50', 'bg-white')}
                  />
                  <label className="flex items-center gap-3 rounded-[1.5rem] border border-stroke bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={lesson.isPreview}
                      onChange={(event) => setLessons((current) => current.map((item, lessonIndex) => lessonIndex === index ? { ...item, isPreview: event.target.checked } : item))}
                      className="size-4"
                    />
                    Cho phep hoc vien guest xem preview lesson nay
                  </label>
                </div>
                {Object.entries(mergedFieldErrors).filter(([field]) => field.startsWith(`lessons.${index}.materials.`)).length > 0 ? (
                  <div className="mt-2 grid gap-1">
                    {Object.entries(mergedFieldErrors)
                      .filter(([field]) => field.startsWith(`lessons.${index}.materials.`))
                      .map(([field, message]) => (
                        <span key={field} className="text-xs font-semibold text-rose-600">{message}</span>
                      ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        {formError ? (
          <QueryErrorState title="Khong tao duoc khoa hoc" description={formError} />
        ) : createMutation.error ? (
          <QueryErrorState title="Khong tao duoc khoa hoc" description={getApiErrorMessage(createMutation.error)} />
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createMutation.isPending || hasBlockingErrors}
            className="rounded-2xl bg-teal-50 px-6 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMutation.isPending ? 'Dang dong goi khoa hoc...' : 'Tao khoa hoc va lessons'}
          </button>
        </div>
      </form>
    </div>
  );
}
