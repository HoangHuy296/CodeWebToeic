import { Link } from 'react-router-dom';

export function SiteLogo() {
  return (
    <Link to="/" className="group inline-flex items-center gap-3">
      <span className="brand-mark inline-flex h-11 w-11 items-center justify-center rounded-lg text-sm font-semibold tracking-[0.2em]">
        IV
      </span>
      <span className="flex flex-col">
        <span className="text-[0.72rem] font-semibold tracking-[0.3em] text-teal-700 uppercase">
          English CRM
        </span>
        <span className="text-lg font-extrabold tracking-tight text-slate-950 transition group-hover:text-teal-700">
          IVYTS 1998
        </span>
      </span>
    </Link>
  );
}
