interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_26px_70px_rgba(15,23,42,0.09)] backdrop-blur lg:p-12">
      <p className="text-xs font-semibold tracking-[0.35em] text-teal-700 uppercase">{eyebrow}</p>
      <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{description}</p>
    </section>
  );
}

