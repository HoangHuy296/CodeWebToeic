export function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-[var(--color-brand)] transition-all duration-500"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
