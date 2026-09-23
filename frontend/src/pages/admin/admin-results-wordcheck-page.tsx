import { PageHero } from '../../components/common/page-hero';
import { WordScoreResultsTable } from '../../components/admin/word-score-results-table';

export function AdminResultsWordcheckPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="wordcheck scorebook"
        title="Diem luyen tap Kiem tra (/wordcheck)"
        description="Theo doi ket qua cua tung nguoi dung khi chon luyen tap tu do o /wordcheck: bo cau hoi da lam, ty le dung lan dau, so vong on lai va thoi gian hoan thanh."
      />
      <WordScoreResultsTable mode="extra" />
    </div>
  );
}
