import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { getApiErrorMessage, getApiFieldErrors } from '../../lib/api';
import { exerciseApi } from '../../lib/exercise-api';
import { exerciseSessionApi } from '../../lib/exercise-session-api';
import type { ExerciseTopic, ExerciseTopicPayload } from '../../types/exercise';

function createDraft(topic?: ExerciseTopic): ExerciseTopicPayload {
  return {
    slug: topic?.slug ?? '',
    label: topic?.label ?? '',
    shortLabel: topic?.shortLabel ?? '',
    description: topic?.description ?? '',
    accent: topic?.accent ?? 'from-sky-500/20 via-cyan-400/10 to-emerald-400/20',
    keywords: topic?.keywords ?? [],
    sections: [],
  };
}

export function AdminExerciseTopicsPage() {
  const queryClient = useQueryClient();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ExerciseTopicPayload>(createDraft());

  const topicsQuery = useQuery({
    queryKey: ['admin', 'exercise-topics'],
    queryFn: exerciseApi.listTopics,
  });
  const itemsQuery = useQuery({
    queryKey: ['admin', 'exercise-items', 'all'],
    queryFn: () => exerciseSessionApi.list(),
  });

  useEffect(() => {
    if (!selectedTopicId || !topicsQuery.data) {
      return;
    }
    const topic = topicsQuery.data.find((item) => item.id === selectedTopicId);
    if (topic) {
      setDraft(createDraft(topic));
    }
  }, [selectedTopicId, topicsQuery.data]);

  const exerciseCountByTopic = useMemo(() => {
    const counter = new Map<string, number>();
    (itemsQuery.data ?? []).forEach((item) => {
      const slug = item.exerciseTopicSlug;
      if (!slug) {
        return;
      }
      counter.set(slug, (counter.get(slug) ?? 0) + 1);
    });
    return counter;
  }, [itemsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => (selectedTopicId ? exerciseApi.updateTopic(selectedTopicId, draft) : exerciseApi.createTopic(draft)),
    onSuccess: async (result) => {
      setSelectedTopicId(result.id);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'exercise-topics'] });
      await queryClient.invalidateQueries({ queryKey: ['public', 'exercise-topics'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => exerciseApi.removeTopic(id),
    onSuccess: async () => {
      setSelectedTopicId(null);
      setDraft(createDraft());
      await queryClient.invalidateQueries({ queryKey: ['admin', 'exercise-topics'] });
      await queryClient.invalidateQueries({ queryKey: ['public', 'exercise-topics'] });
    },
  });

  const fieldErrors = getApiFieldErrors(saveMutation.error);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.35em] text-teal-700 uppercase">admin exercises</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Quan ly chu de on tap va so luong bai tap theo tung chu de.</h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">
              Khu nay chi giu lai nhung thu can thiet: ten chu de, mo ta, accent, keywords va tong so bai tap theo chu de.
              Cac bai tap se duoc tao rieng trong workspace bai tap va gan truc tiep vao mot chu de on tap.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedTopicId(null);
                setDraft(createDraft());
              }}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Tao chu de moi
            </button>
            <Link
              to="/admin/exercises/items"
              className="rounded-2xl border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Mo workspace bai tap
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Chu de hien co</h2>
          {topicsQuery.isPending || itemsQuery.isPending ? <div className="mt-6"><QueryLoadingState title="Dang tai chu de..." /></div> : null}
          {topicsQuery.error || itemsQuery.error ? (
            <div className="mt-6">
              <QueryErrorState title="Khong tai duoc chu de" description={getApiErrorMessage(topicsQuery.error ?? itemsQuery.error)} />
            </div>
          ) : null}

          <div className="mt-6 grid gap-3">
            {(topicsQuery.data ?? []).map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelectedTopicId(topic.id)}
                className={[
                  'rounded-[1.5rem] border px-4 py-4 text-left transition',
                  selectedTopicId === topic.id ? 'border-teal-300 bg-teal-50' : 'border-stroke bg-slate-50 hover:bg-white',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{topic.label}</p>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                    {exerciseCountByTopic.get(topic.slug) ?? 0} bai tap
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">{topic.description}</p>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">{selectedTopicId ? 'Chinh sua chu de' : 'Tao chu de moi'}</h2>
              <p className="mt-2 text-sm text-slate-600">Khong con section hay packs. Moi bai tap chi can duoc gan vao mot chu de on tap.</p>
            </div>
            {selectedTopicId ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Xoa chu de nay?')) {
                    deleteMutation.mutate(selectedTopicId);
                  }
                }}
                className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
              >
                Xoa chu de
              </button>
            ) : null}
          </div>

          {saveMutation.error ? (
            <div className="mt-6">
              <QueryErrorState title="Khong luu duoc chu de" description={getApiErrorMessage(saveMutation.error)} />
            </div>
          ) : null}

          <form
            className="mt-6 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              saveMutation.mutate();
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={draft.label}
                onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
                placeholder="Label chu de"
                className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
              />
              <input
                value={draft.shortLabel}
                onChange={(event) => setDraft((current) => ({ ...current, shortLabel: event.target.value }))}
                placeholder="Short label"
                className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
              />
            </div>
            {fieldErrors.label ? <p className="text-sm text-rose-600">{fieldErrors.label}</p> : null}

            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={draft.slug ?? ''}
                onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))}
                placeholder="Slug tuy chinh"
                className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
              />
              <input
                value={draft.accent}
                onChange={(event) => setDraft((current) => ({ ...current, accent: event.target.value }))}
                placeholder="Tailwind gradient accent"
                className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
              />
            </div>

            <textarea
              rows={4}
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              placeholder="Mo ta chu de"
              className="rounded-[1.5rem] border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
            />

            <textarea
              rows={2}
              value={draft.keywords.join(', ')}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  keywords: event.target.value.split(',').map((item) => item.trim()).filter(Boolean),
                }))
              }
              placeholder="grammar, toeic, practice set"
              className="rounded-[1.5rem] border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveMutation.isPending ? 'Dang luu chu de...' : selectedTopicId ? 'Cap nhat chu de' : 'Tao chu de'}
              </button>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
}
