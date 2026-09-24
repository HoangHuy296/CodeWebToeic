import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation('public');

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-xl rounded-[2rem] border border-stroke bg-white/90 p-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold tracking-[0.35em] text-teal-700 uppercase">{t('notFound.eyebrow')}</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950">{t('notFound.title')}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          {t('notFound.description')}
        </p>
        <Link to="/" className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
          {t('notFound.backHome')}
        </Link>
      </div>
    </div>
  );
}
