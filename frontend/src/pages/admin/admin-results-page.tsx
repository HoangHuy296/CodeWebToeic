import { useState } from 'react';
import { WorkspaceMockTestResultsPage } from '../shared/workspace-mock-test-results-page';
import { WordScoreResultsTable } from '../../components/admin/word-score-results-table';

type ResultsTab = 'mocktest' | 'review';

export function AdminResultsPage() {
  const [tab, setTab] = useState<ResultsTab>('mocktest');

  return (
    <div className="space-y-8">
      <div className="inline-flex rounded-full border border-stroke bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <button
          type="button"
          onClick={() => setTab('mocktest')}
          className={[
            'rounded-full px-5 py-2.5 text-sm font-semibold transition',
            tab === 'mocktest' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:text-slate-900',
          ].join(' ')}
        >
          Mock Test
        </button>
        <button
          type="button"
          onClick={() => setTab('review')}
          className={[
            'rounded-full px-5 py-2.5 text-sm font-semibold transition',
            tab === 'review' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:text-slate-900',
          ].join(' ')}
        >
          On tap (/review)
        </button>
      </div>

      {tab === 'mocktest' ? (
        <WorkspaceMockTestResultsPage audience="admin" />
      ) : (
        <div className="space-y-8">
          <section className="surface-soft rounded-[1.5rem] p-6 sm:p-8 lg:p-12">
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-teal-700 uppercase">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              review scorebook
            </p>
            <h1 className="mt-4 max-w-4xl text-3xl leading-snug font-semibold tracking-tight text-slate-900 sm:text-5xl sm:leading-tight">
              Diem on tap cach quang (/review)
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
              Theo doi ket qua cua tung nguoi dung khi chon on tap theo lich o /review: bo cau hoi da on, ty le dung
              lan dau, so vong on lai va thoi gian hoan thanh.
            </p>
          </section>
          <WordScoreResultsTable mode="schedule" />
        </div>
      )}
    </div>
  );
}
