import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { learningApi, learningQueryKeys } from '../../lib/learning-api';
import type { Enrollment } from '../../types/enrollment';
import { ProgressBar } from './progress-bar';

const LEVEL_KEYS = ['beginner', 'intermediate', 'advanced'] as const;
type LevelKey = (typeof LEVEL_KEYS)[number];

function isLevelKey(value: string): value is LevelKey {
  return (LEVEL_KEYS as readonly string[]).includes(value);
}

export function CourseProgressCard({ enrollment }: { enrollment: Enrollment }) {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const learningPath = `/student/learn/${enrollment.course.id}`;

  const prefetchLearning = () => {
    void queryClient.prefetchQuery({
      queryKey: learningQueryKeys.detail(enrollment.course.id),
      queryFn: () => learningApi.detail(enrollment.course.id),
      staleTime: 60_000,
    });
  };

  return (
    <article className="overflow-hidden rounded-[1.8rem] border border-stroke bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
      {enrollment.course.thumbnail ? (
        <img
          src={enrollment.course.thumbnail}
          alt={enrollment.course.title ?? 'Course'}
          className="h-48 w-full object-cover"
        />
      ) : null}
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            {t(`statuses.${enrollment.status}`)}
          </span>
          <span className="text-sm font-semibold text-slate-500">{enrollment.progressPercent}%</span>
        </div>

        <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950">
          {enrollment.course.title ?? 'Course'}
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          {t('counts.lessons', { count: enrollment.course.lessonCount ?? 0 })}
          {enrollment.course.level && isLevelKey(enrollment.course.level)
            ? ` · ${t(`levels.${enrollment.course.level}`)}`
            : ''}
        </p>

        <div className="mt-5">
          <ProgressBar value={enrollment.progressPercent} />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {t('courseCompletedLessons', {
              completed: enrollment.completedLessonIds.length,
              total: enrollment.course.lessonCount ?? 0,
            })}
          </p>
          <Link
            to={learningPath}
            onMouseEnter={prefetchLearning}
            onFocus={prefetchLearning}
            className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {t('actions.continue')}
          </Link>
        </div>
      </div>
    </article>
  );
}
