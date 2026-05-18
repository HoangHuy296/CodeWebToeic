import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../../app/providers/notification-provider';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { getApiErrorMessage } from '../../lib/api';
import { formatDateTime, parseCommaList } from '../../lib/format';
import { postApi } from '../../lib/post-api';
import type { BlogPost, PostPayload } from '../../types/post';

function createDraft(post?: BlogPost): PostPayload {
  return {
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    content: post?.content ?? '',
    coverImage: post?.coverImage ?? '',
    tags: post?.tags ?? [],
    status: post?.status ?? 'draft',
    seoDescription: post?.seoDescription ?? '',
  };
}

export function AdminPostsPage() {
  const queryClient = useQueryClient();
  const { pushClientNotification } = useNotifications();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PostPayload>(createDraft());
  const postsQuery = useQuery({
    queryKey: ['admin', 'posts'],
    queryFn: postApi.list,
  });

  useEffect(() => {
    if (selectedPostId && postsQuery.data) {
      const target = postsQuery.data.find((post) => post.id === selectedPostId);

      if (target) {
        setDraft(createDraft(target));
      }
    }
  }, [selectedPostId, postsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => (selectedPostId ? postApi.update(selectedPostId, draft) : postApi.create(draft)),
    onSuccess: async (result) => {
      setSelectedPostId(result.id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postApi.remove(id),
    onSuccess: async () => {
      setSelectedPostId(null);
      setDraft(createDraft());
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ]);
    },
    onError: (error) => {
      pushClientNotification({
        title: 'Xoa bai viet that bai',
        message: getApiErrorMessage(error),
        severity: 'error',
        entityType: 'post',
      });
    },
  });

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.35em] text-teal-700 uppercase">admin posts</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Editorial desk cho draft, publish va archive bai viet.</h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">
              Trang nay da noi that den BlogPost CRUD. Admin co the mo bai viet cu de cap nhat hoac tao bai moi ngay trong dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedPostId(null);
              setDraft(createDraft());
            }}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Tao bai viet moi
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Thu vien bai viet</h2>

          {postsQuery.isPending ? <div className="mt-6"><QueryLoadingState title="Dang tai bai viet..." /></div> : null}
          {postsQuery.error ? (
            <div className="mt-6">
              <QueryErrorState title="Khong tai duoc bai viet" description={getApiErrorMessage(postsQuery.error)} />
            </div>
          ) : null}

          <div className="mt-6 grid gap-3">
            {(postsQuery.data ?? []).map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedPostId(post.id)}
                className={[
                  'rounded-[1.5rem] border px-4 py-4 text-left transition',
                  selectedPostId === post.id ? 'border-teal-300 bg-teal-50' : 'border-stroke bg-slate-50 hover:bg-white',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{post.title}</p>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                    {post.status}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-600">{post.excerpt}</p>
                <p className="mt-3 text-xs text-slate-500">
                  {post.author.fullName ?? post.author.email ?? 'No author'} - {formatDateTime(post.publishedAt)}
                </p>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">{selectedPostId ? 'Chinh sua bai viet' : 'Tao bai viet moi'}</h2>
              <p className="mt-2 text-sm text-slate-600">Editor MVP uu tien su dung nhanh va dung payload backend.</p>
            </div>

            {selectedPostId ? (
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (window.confirm('Xoa bai viet nay?')) {
                    deleteMutation.mutate(selectedPostId);
                  }
                }}
                className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
              >
                Xoa bai viet
              </button>
            ) : null}
          </div>

          {(saveMutation.error || deleteMutation.error) ? (
            <div className="mt-6">
              <QueryErrorState
                title="Khong luu duoc bai viet"
                description={getApiErrorMessage(saveMutation.error ?? deleteMutation.error)}
              />
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
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Tieu de bai viet"
                className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
              />
              <input
                value={draft.slug ?? ''}
                onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))}
                placeholder="Slug tuy chinh"
                className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={draft.status}
                onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as NonNullable<PostPayload['status']> }))}
                className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <input
                value={draft.coverImage ?? ''}
                onChange={(event) => setDraft((current) => ({ ...current, coverImage: event.target.value }))}
                placeholder="Cover image URL"
                className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
              />
            </div>

            <textarea
              rows={3}
              value={draft.excerpt}
              onChange={(event) => setDraft((current) => ({ ...current, excerpt: event.target.value }))}
              placeholder="Excerpt ngan gon cho preview"
              className="rounded-[1.5rem] border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
            />

            <textarea
              rows={10}
              value={draft.content}
              onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
              placeholder="Noi dung bai viet"
              className="rounded-[1.5rem] border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <textarea
                rows={3}
                value={(draft.tags ?? []).join(', ')}
                onChange={(event) => setDraft((current) => ({ ...current, tags: parseCommaList(event.target.value) }))}
                placeholder="toeic, strategy, reading"
                className="rounded-[1.5rem] border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
              />
              <textarea
                rows={3}
                value={draft.seoDescription ?? ''}
                onChange={(event) => setDraft((current) => ({ ...current, seoDescription: event.target.value }))}
                placeholder="SEO description ngan"
                className="rounded-[1.5rem] border border-stroke bg-slate-50 px-4 py-3 outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveMutation.isPending ? 'Dang luu bai viet...' : selectedPostId ? 'Cap nhat bai viet' : 'Dang bai viet moi'}
              </button>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
}
