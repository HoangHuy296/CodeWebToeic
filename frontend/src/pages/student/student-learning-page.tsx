import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { ProgressBar } from '../../components/common/progress-bar';
import { enrollmentApi, enrollmentQueryKeys } from '../../lib/enrollment-api';
import { learningApi, learningQueryKeys } from '../../lib/learning-api';
import { formatDurationMinutes, toYouTubeEmbed } from '../../lib/media';
import { getApiErrorMessage } from '../../lib/api';
import type { CourseLesson } from '../../types/course';

export function StudentLearningPage() {
  const { courseId } = useParams();
  const queryClient = useQueryClient();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);

  const learningQuery = useQuery({
    queryKey: learningQueryKeys.detail(courseId!),
    enabled: Boolean(courseId),
    queryFn: () => learningApi.detail(courseId!),
  });

  const enrollment = learningQuery.data?.enrollment;
  const course = learningQuery.data?.course;
  const lessons = learningQuery.data?.lessons ?? [];
  const selectedLesson =
    lessons.find((lesson) => lesson.id === selectedLessonId) ??
    lessons.find((lesson) => lesson.id === learningQuery.data?.currentLessonId) ??
    lessons[0] ??
    null;

  const progressMutation = useMutation({
    mutationFn: (lesson: CourseLesson) =>
      enrollmentApi.updateProgress(courseId!, {
        lessonId: lesson.id,
        watchedSeconds: lesson.video.duration ?? 0,
        isCompleted: true,
        lastAccessedAt: new Date().toISOString(),
      }),
    onSuccess: () => {
      setProgressMessage('Da cap nhat tien do hoc tap.');
      void queryClient.invalidateQueries({ queryKey: learningQueryKeys.detail(courseId!) });
      void queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.mine });
    },
    onError: (error) => {
      setProgressMessage(getApiErrorMessage(error));
    },
  });

  const currentLessonProgress = enrollment?.lessonProgress.find((item) => item.lessonId === selectedLesson?.id);
  const embedUrl = selectedLesson ? toYouTubeEmbed(selectedLesson.video.videoUrl) : null;

  return (
    <div className="space-y-8">
      {learningQuery.isPending ? (
        <QueryLoadingState title="Dang tai khong gian hoc tap..." />
      ) : null}
      {learningQuery.error ? (
        <QueryErrorState title="Khong tai duoc du lieu hoc tap" description={getApiErrorMessage(learningQuery.error)} />
      ) : null}

      {enrollment && course && selectedLesson ? (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-stroke bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">learning progress</p>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
              {course.title}
            </h1>

            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-600">
                <span>Tien do hien tai</span>
                <span>{enrollment.progressPercent}%</span>
              </div>
              <ProgressBar value={enrollment.progressPercent} />
            </div>

            <div className="mt-6 grid gap-3">
              {lessons.map((lesson) => {
                const progress = enrollment.lessonProgress.find((item) => item.lessonId === lesson.id);
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={[
                      'rounded-[1.4rem] border px-4 py-4 text-left transition',
                      selectedLesson.id === lesson.id
                        ? 'border-teal-400 bg-teal-50'
                        : 'border-stroke bg-slate-50 hover:bg-white',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Lesson {lesson.order}
                      </span>
                      {progress?.isCompleted ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-700">
                          Done
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{lesson.title}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="space-y-6">
            <section className="overflow-hidden rounded-[2rem] border border-stroke bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              {embedUrl ? (
                <iframe
                  title={selectedLesson.title}
                  src={embedUrl}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={selectedLesson.video.thumbnail ?? course.thumbnail}
                  alt={selectedLesson.title}
                  className="aspect-video w-full object-cover"
                />
              )}
            </section>

            <section className="rounded-[2rem] border border-stroke bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">
                    Lesson {selectedLesson.order}
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                    {selectedLesson.title}
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  {formatDurationMinutes(selectedLesson.video.duration ?? 0)}
                </span>
              </div>

              <p className="mt-5 text-sm leading-8 text-slate-600">{selectedLesson.description}</p>
              {selectedLesson.content ? (
                <p className="mt-4 text-sm leading-8 text-slate-600">{selectedLesson.content}</p>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setProgressMessage(null);
                    void progressMutation.mutate(selectedLesson);
                  }}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  {progressMutation.isPending ? 'Dang cap nhat...' : 'Danh dau da hoc xong'}
                </button>
                {currentLessonProgress?.isCompleted ? (
                  <span className="rounded-full bg-emerald-100 px-5 py-3 text-sm font-semibold text-emerald-700">
                    Lesson da hoan thanh
                  </span>
                ) : null}
              </div>

              {progressMessage ? <p className="mt-4 text-sm font-medium text-slate-600">{progressMessage}</p> : null}
            </section>

            <section className="rounded-[2rem] border border-stroke bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <h3 className="text-2xl font-black tracking-tight text-slate-950">Tai lieu lesson</h3>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {selectedLesson.materials.map((material) => (
                  <a
                    key={material.fileUrl}
                    href={material.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-[1.4rem] bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    {material.title}
                  </a>
                ))}
              </div>
            </section>
          </main>
        </div>
      ) : null}
    </div>
  );
}
