import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_480px] lg:items-stretch">
      <section className="brand-panel rounded-[1.5rem] p-6 sm:p-10">
        <p className="panel-eyebrow text-xs font-semibold tracking-[0.3em] uppercase">English CRM · IVYTS</p>
        <h1 className="mt-5 text-3xl leading-snug font-semibold tracking-tight sm:text-4xl">
          Mỗi ngày một bước tiến trên hành trình học tiếng Anh.
        </h1>
        <p className="panel-muted mt-5 max-w-xl text-sm leading-7">
          Không gian học tập và giảng dạy, nơi mỗi mục tiêu đều có một lộ trình rõ ràng.
        </p>
        <div className="mt-8 grid gap-4">
          {[
            'Học theo lộ trình phù hợp với mục tiêu của bạn.',
            'Luyện tập và theo dõi sự tiến bộ mỗi ngày.',
            'Kết nối cùng giảng viên trong suốt quá trình học.',
          ].map((item) => (
            <div key={item} className="rounded-lg border border-white/15 bg-white/5 px-4 py-4 text-sm leading-7">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card min-w-0 rounded-[1.5rem] p-6 lg:p-8">
        <Outlet />
      </section>
    </div>
  );
}
