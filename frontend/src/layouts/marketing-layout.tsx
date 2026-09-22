import { Outlet } from 'react-router-dom';
import { SiteFooter } from '../components/common/site-footer';
import { SiteHeader } from '../components/common/site-header';

export function MarketingLayout() {
  return (
    <div className="min-h-screen bg-page text-slate-900">
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
