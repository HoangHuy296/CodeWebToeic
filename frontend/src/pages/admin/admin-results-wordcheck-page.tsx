import { useTranslation } from 'react-i18next';
import { PageHero } from '../../components/common/page-hero';
import { WordScoreResultsTable } from '../../components/admin/word-score-results-table';

export function AdminResultsWordcheckPage() {
  const { t } = useTranslation('admin');
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow={t('wordScoreResults.extraEyebrow')}
        title={t('wordScoreResults.extraTitle')}
        description={t('wordScoreResults.extraDescription')}
      />
      <WordScoreResultsTable mode="extra" />
    </div>
  );
}
