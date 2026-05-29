import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ExerciseCard } from '../../components/common/exercise-card';
import { PaginationControls } from '../../components/common/pagination-controls';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { getApiErrorMessage } from '../../lib/api';
import { exerciseApi } from '../../lib/exercise-api';
import { exerciseSessionApi } from '../../lib/exercise-session-api';

export function ExerciseHubPage() {
  const pageSize = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string>('all');

  const topicsQuery = useQuery({
    queryKey: ['public', 'exercise-topics'],
    queryFn: exerciseApi.listTopics,
  });
  const exercisesQuery = useQuery({
    queryKey: ['public', 'exercise-items'],
    queryFn: () => exerciseSessionApi.list(),
  });

  const topics = topicsQuery.data ?? [];
  const exercises = exercisesQuery.data ?? [];
  const topicLabelBySlug = useMemo(
    () => new Map(topics.map((topic) => [topic.slug, topic.label])),
    [topics],
  );

  const filteredExercises = useMemo(
    () =>
      exercises.filter((exercise) =>
        selectedTopicSlug === 'all' ? true : exercise.exerciseTopicSlug === selectedTopicSlug,
      ),
    [exercises, selectedTopicSlug],
  );

  const totalPages = Math.max(1, Math.ceil(filteredExercises.length / pageSize));
  const paginatedExercises = useMemo(
    () => filteredExercises.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredExercises],
  );

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="bai tap"
        title="Kho bai tap on tap de lam ngay theo tung chu de tieng Anh."
        description="Moi bai tap se dua ban vao giao dien lam bai giong luyen thi, co timer, cham diem va review. Admin chi can CRUD chu de on tap va bai tap trong dashboard la du."
      />

      {topicsQuery.isPending || exercisesQuery.isPending ? <QueryLoadingState title="Dang tai bai tap on tap..." /> : null}
      {topicsQuery.error || exercisesQuery.error ? (
        <QueryErrorState
          title="Khong tai duoc danh sach bai tap"
          description={getApiErrorMessage(topicsQuery.error ?? exercisesQuery.error)}
        />
      ) : null}

      <section className="rounded-[2rem] border border-stroke bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Danh muc chu de</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Loc bai tap theo chu de on tap</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            Ban co the chon mot chu de de xem nhom bai tap lien quan, hoac mo trang chi tiet chu de de xem toan bo bai tap theo nhan do.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedTopicSlug('all');
              setCurrentPage(1);
            }}
            className={[
              'rounded-full px-4 py-2.5 text-sm font-semibold transition',
              selectedTopicSlug === 'all'
                ? 'bg-slate-950 text-white shadow-[0_14px_28px_rgba(15,23,42,0.16)]'
                : 'border border-stroke bg-slate-50 text-slate-700 hover:bg-white',
            ].join(' ')}
          >
            Tat ca bai tap
          </button>

          {topics.map((topic) => (
            <div key={topic.id} className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedTopicSlug(topic.slug);
                  setCurrentPage(1);
                }}
                className={[
                  'rounded-full px-4 py-2.5 text-sm font-semibold transition',
                  selectedTopicSlug === topic.slug
                    ? 'bg-slate-950 text-white shadow-[0_14px_28px_rgba(15,23,42,0.16)]'
                    : 'border border-stroke bg-slate-50 text-slate-700 hover:bg-white',
                ].join(' ')}
              >
                {topic.label}
              </button>
              <Link to={`/exercises/${topic.slug}`} className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                Xem rieng
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {paginatedExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            topicLabel={topicLabelBySlug.get(exercise.exerciseTopicSlug ?? '')}
          />
        ))}
      </section>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filteredExercises.length}
        itemLabel="bai tap"
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
