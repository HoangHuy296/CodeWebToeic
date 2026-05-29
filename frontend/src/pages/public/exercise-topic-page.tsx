import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../app/providers/auth-provider';
import { ExerciseCard } from '../../components/common/exercise-card';
import { PaginationControls } from '../../components/common/pagination-controls';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { getApiErrorMessage } from '../../lib/api';
import { exerciseApi } from '../../lib/exercise-api';
import { exerciseSessionApi } from '../../lib/exercise-session-api';

export function ExerciseTopicPage() {
  const { topicSlug } = useParams();
  const { role } = useAuth();
  const pageSize = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const topicQuery = useQuery({
    queryKey: ['exercise-topic', topicSlug],
    queryFn: () => exerciseApi.detailTopic(topicSlug!),
    enabled: Boolean(topicSlug),
  });
  const exercisesQuery = useQuery({
    queryKey: ['exercise-topic', topicSlug, 'items'],
    queryFn: () => exerciseSessionApi.list({ topicSlug }),
    enabled: Boolean(topicSlug),
  });

  const topic = topicQuery.data;
  const exercises = exercisesQuery.data ?? [];
  const totalPages = Math.max(1, Math.ceil(exercises.length / pageSize));
  const paginatedExercises = useMemo(
    () => exercises.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, exercises],
  );

  const workspacePath = role === 'admin' ? '/admin/exercises/items' : role === 'teacher' ? '/teacher/exercises/items' : null;

  if (topicQuery.isPending) {
    return <QueryLoadingState title="Dang tai chu de bai tap..." />;
  }

  if (topicQuery.error) {
    return <QueryErrorState title="Khong tim thay chu de bai tap" description={getApiErrorMessage(topicQuery.error)} />;
  }

  if (!topic) {
    return <QueryErrorState title="Khong tim thay chu de bai tap" description="Chu de nay chua duoc khoi tao hoac da bi doi slug." />;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-stroke bg-white px-6 py-8 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-700">bai tap / {topic.shortLabel}</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">{topic.label}</h1>
            <p className="mt-4 text-sm leading-8 text-slate-600">{topic.description}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/exercises" className="rounded-full border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-800">
              Ve danh sach bai tap
            </Link>
            {workspacePath ? (
              <Link to={workspacePath} className="btn-brand rounded-full px-5 py-3 text-sm font-semibold text-white">
                Mo workspace bai tap
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {exercisesQuery.isPending ? <QueryLoadingState title="Dang tai bai tap theo chu de..." /> : null}
      {exercisesQuery.error ? (
        <QueryErrorState title="Khong tai duoc bai tap theo chu de" description={getApiErrorMessage(exercisesQuery.error)} />
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {paginatedExercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} topicLabel={topic.label} />
        ))}
      </section>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={exercises.length}
        itemLabel="bai tap"
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
