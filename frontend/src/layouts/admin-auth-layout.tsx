import { Outlet } from 'react-router-dom';

export function AdminAuthLayout() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_440px] lg:items-stretch">
      <section className="rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.92),rgba(14,116,144,0.88))] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] lg:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
          Admin access
        </p>
        <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight">
          Khu vuc quan tri rieng cho van hanh he thong, duyet noi dung va theo doi toan bo CRM.
        </h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            'Dashboard thong ke, doanh thu, enrollment va trang thai he thong',
            'Duyet khoa hoc draft cua giang vien va quan ly noi dung xuat ban',
            'Quan ly nguoi dung, mock tests, posts va message inbox noi bo',
            'Truy cap tach biet voi login rieng de tranh nham lan voi workspace khac',
          ].map((item) => (
            <div
              key={item}
              className="rounded-[1.5rem] border border-white/10 bg-white/8 px-4 py-4 text-sm font-medium text-slate-100 backdrop-blur-sm"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:p-8">
        <Outlet />
      </section>
    </div>
  );
}
