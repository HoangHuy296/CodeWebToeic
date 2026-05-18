interface QueryStateProps {
  title: string;
  description?: string;
}

export function QueryLoadingState({ title, description }: QueryStateProps) {
  return (
    <div className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description ? <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p> : null}
    </div>
  );
}

export function QueryErrorState({ title, description }: QueryStateProps) {
  return (
    <div className="rounded-[1.8rem] border border-rose-200 bg-rose-50 p-6">
      <p className="text-sm font-semibold text-rose-800">{title}</p>
      {description ? <p className="mt-2 text-sm leading-7 text-rose-700">{description}</p> : null}
    </div>
  );
}

