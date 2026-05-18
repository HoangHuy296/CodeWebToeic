interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
}

export function PlaceholderPage({ eyebrow, title, description, bullets }: PlaceholderPageProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_26px_70px_rgba(15,23,42,0.08)] backdrop-blur lg:p-12">
        <p className="text-xs font-semibold tracking-[0.35em] text-teal-700 uppercase">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">{title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{description}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {bullets.map((item) => (
          <article
            key={item}
            className="rounded-[1.6rem] border border-stroke bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
          >
            <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-teal-700 uppercase">
              foundation
            </span>
            <p className="mt-4 text-sm font-semibold leading-7 text-slate-700">{item}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

