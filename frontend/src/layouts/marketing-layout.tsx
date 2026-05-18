import { Outlet } from 'react-router-dom';
import { SiteFooter } from '../components/common/site-footer';
import { SiteHeader } from '../components/common/site-header';

export function MarketingLayout() {
  return (
    <div className="min-h-screen bg-page text-slate-900">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.18),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_34%)]" />
      <SiteHeader />
      <div className="relative">
        <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}

