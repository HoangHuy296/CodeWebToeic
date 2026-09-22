interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="surface-soft rounded-[1.5rem] p-6 sm:p-8 lg:p-12">
      <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-teal-700 uppercase">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-teal-500" />
        {eyebrow}
      </p>
      <h1 className="mt-4 max-w-4xl text-3xl leading-snug font-semibold tracking-tight text-slate-900 sm:text-5xl sm:leading-tight">
        {title}
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{description}</p>
    </section>
  );
}
