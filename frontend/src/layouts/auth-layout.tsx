import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_480px] lg:items-stretch">
      <section className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,118,110,0.92))] p-10 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
        <p className="text-xs font-semibold tracking-[0.35em] uppercase text-teal-200">Phase 9 foundation</p>
        <h1 className="mt-5 text-4xl font-black tracking-tight">
          Xac thuc, router va phan quyen da san sang de mo rong thanh CRM day du.
        </h1>
        <div className="mt-8 grid gap-4">
          {[
            'Login/register ket noi backend that',
            'Auth context bootstrap bang TanStack Query',
            'Role-based routes cho student, teacher, admin',
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-slate-100">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:p-8">
        <Outlet />
      </section>
    </div>
  );
}

