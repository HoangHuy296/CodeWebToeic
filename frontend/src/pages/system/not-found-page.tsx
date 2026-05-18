import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-xl rounded-[2rem] border border-white/70 bg-white/90 p-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold tracking-[0.35em] text-teal-700 uppercase">404</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Khong tim thay trang</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Route nay chua ton tai hoac chua duoc goi dung. Frontend foundation da co not-found state rieng.
        </p>
        <Link to="/" className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
          Ve trang chu
        </Link>
      </div>
    </div>
  );
}

