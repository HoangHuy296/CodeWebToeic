import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { getApiErrorMessage } from '../../lib/api';
import { postApi } from '../../lib/post-api';
import { NotFoundPage } from '../system/not-found-page';

export function BlogDetailPage() {
  const { slug } = useParams();
  const articleQuery = useQuery({
    queryKey: ['public', 'posts', slug],
    queryFn: () => postApi.detailBySlug(slug!),
    enabled: Boolean(slug),
  });

  if (articleQuery.isPending) {
    return <QueryLoadingState title="Dang tai chi tiet bai viet..." />;
  }

  if (articleQuery.error) {
    return <QueryErrorState title="Khong tai duoc bai viet" description={getApiErrorMessage(articleQuery.error)} />;
  }

  const article = articleQuery.data;

  if (!article) {
    return <NotFoundPage />;
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow={article.tags[0] ?? 'blog'}
        title={article.title}
        description={`${article.author.fullName ?? article.author.email ?? 'IVYTS Editorial'} · ${article.publishedAt ?? 'Dang cap nhat'}`}
      />

      <img src={article.coverImage} alt={article.title} className="h-[24rem] w-full rounded-[2rem] object-cover shadow-[0_24px_70px_rgba(15,23,42,0.1)]" />

      <article className="rounded-[2rem] border border-stroke bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:p-12">
        <div className="mx-auto max-w-3xl space-y-6 text-base leading-8 text-slate-700">
          {article.content.split(/\n{2,}/).filter(Boolean).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
