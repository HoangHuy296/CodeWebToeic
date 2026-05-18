import { useParams } from 'react-router-dom';
import { PageHero } from '../../components/common/page-hero';
import { blogArticles } from '../../lib/blog-content';
import { NotFoundPage } from '../system/not-found-page';

export function BlogDetailPage() {
  const { slug } = useParams();
  const article = blogArticles.find((item) => item.slug === slug);

  if (!article) {
    return <NotFoundPage />;
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow={article.category}
        title={article.title}
        description={`${article.author} · ${article.readMinutes} phut doc · ${article.publishedAt}`}
      />

      <img src={article.coverImage} alt={article.title} className="h-[24rem] w-full rounded-[2rem] object-cover shadow-[0_24px_70px_rgba(15,23,42,0.1)]" />

      <article className="rounded-[2rem] border border-stroke bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:p-12">
        <div className="mx-auto max-w-3xl space-y-6 text-base leading-8 text-slate-700">
          {article.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
