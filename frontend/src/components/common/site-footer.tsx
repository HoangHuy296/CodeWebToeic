import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function SiteFooter() {
  const { t } = useTranslation('navigation');

  return (
    <footer className="brand-panel border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <p className="panel-eyebrow text-xs font-semibold tracking-[0.3em] uppercase">IVYTS</p>
          <h3 className="mt-4 text-3xl font-extrabold tracking-tight text-white">{t('footer.tagline')}</h3>
          <p className="panel-muted mt-4 max-w-xl text-sm leading-7">{t('footer.description')}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-[0.2em] text-white uppercase">{t('footer.navigation')}</h4>
          <div className="mt-5 grid gap-3 text-sm">
            <Link to="/courses" className="text-slate-400 transition hover:text-white">{t('footer.courses')}</Link>
            <Link to="/mock-test" className="text-slate-400 transition hover:text-white">{t('footer.practice')}</Link>
            <Link to="/blog" className="text-slate-400 transition hover:text-white">{t('footer.blog')}</Link>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-[0.2em] text-white uppercase">{t('footer.resources')}</h4>
          <div className="mt-5 grid gap-3 text-sm">
            <Link to="/portfolio" className="text-slate-400 transition hover:text-white">{t('footer.teacherFeedback')}</Link>
            <Link to="/blog" className="text-slate-400 transition hover:text-white">{t('footer.studyGuides')}</Link>
            <Link to="/admin/login" className="text-slate-400 transition hover:text-white">{t('footer.adminPortal')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
