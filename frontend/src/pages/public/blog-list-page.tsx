import { Link } from 'react-router-dom';
import { PageHero } from '../../components/common/page-hero';
import { blogArticles } from '../../lib/blog-content';

export function BlogListPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="blog"
        title="Study guides cho TOEIC, IELTS va ky nang tu hoc tieng Anh."
        description="Cac bai viet tap trung vao lo trinh diem, cach review loi sai, listening traps, reading speed va thoi quen hoc co the duy tri lau dai."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        {blogArticles.map((article) => (
          <article key={article.slug} className="overflow-hidden rounded-[1.8rem] border border-stroke bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
            <img src={article.coverImage} alt={article.title} className="h-52 w-full object-cover" />
            <div className="p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <span className="text-teal-700">{article.category}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{article.readMinutes} phut doc</span>
              </div>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">{article.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{article.excerpt}</p>
              <Link
                to={`/blog/${article.slug}`}
                className="btn-brand mt-6 inline-flex rounded-full px-4 py-2.5 text-sm font-semibold text-white"
              >
                Doc bai viet
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
