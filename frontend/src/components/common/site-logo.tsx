import { Link } from 'react-router-dom';

export function SiteLogo() {
  return (
    <Link to="/" className="group inline-flex items-center gap-3">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-deep))] text-sm font-black tracking-[0.2em] text-white shadow-[0_12px_30px_rgba(13,148,136,0.28)]">
        IV
      </span>
      <span className="flex flex-col">
        <span className="text-[0.72rem] font-semibold tracking-[0.3em] text-teal-700 uppercase">
          English CRM
        </span>
        <span className="text-lg font-black tracking-tight text-slate-950 transition group-hover:text-teal-700">
          IVYTS 1997
        </span>
      </span>
    </Link>
  );
}
