import { useMemo, useState } from 'react';
import type { DiffWord, Question } from './types';
import type { SessionState } from './state/types';
import { nextButtonLabel, questionsLeftInRound, summarize } from './state/selectors';
import type { useWordSession } from './use-word-session';
import { fmtTime } from './format';
import { dayIndex, dayToDate } from './srs/day';
import { nextReviewDay } from './srs/progress';
import { loadProgress } from './srs/storage';

function DiffLine({ words, badClass }: { words: DiffWord[]; badClass: string }) {
  return (
    <p className="flex flex-wrap gap-x-1.5 gap-y-1 text-sm leading-7">
      {words.map((word, i) => (
        <span key={i} className={word.ok ? 'text-slate-800' : badClass}>
          {word.w}
        </span>
      ))}
    </p>
  );
}

function highlight(text: string, phrase: string): { before: string; match: string; after: string } | null {
  const at = phrase ? text.toLowerCase().indexOf(phrase.toLowerCase()) : -1;
  if (at < 0) return null;
  return { before: text.slice(0, at), match: text.slice(at, at + phrase.length), after: text.slice(at + phrase.length) };
}

function HighlightedLine({ text, phrase, className }: { text: string; phrase: string; className: string }) {
  const parts = highlight(text, phrase);
  if (!parts) return <p className={className}>{text}</p>;
  return (
    <p className={className}>
      {parts.before}
      <strong className="font-bold text-slate-950">{parts.match}</strong>
      {parts.after}
    </p>
  );
}

function QuizCard({
  state,
  question,
  message,
  onSubmit,
}: {
  state: SessionState;
  question: Question;
  message: string | null;
  onSubmit: (typed: string) => void;
}) {
  const [typed, setTyped] = useState('');
  const checking = state.phase === 'checking';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!checking) {
          onSubmit(typed);
          setTyped('');
        }
      }}
      className="rounded-[2rem] border border-stroke bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] lg:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        <span>Vong {state.round}: con {questionsLeftInRound(state)} cum</span>
        <span>Da thuoc {state.mastered}/{state.total}</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">
          {question.part || 'TOEIC'}
        </span>
        {question.topic ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            {question.topic}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-2xl font-extrabold leading-snug text-slate-950">{question.vi}</p>
      {question.accents ? (
        <p className="mt-2 text-xs text-slate-500">
          Dap an co the chua ky tu co dau: <span className="font-semibold">{question.accents}</span>
        </p>
      ) : null}

      <input
        autoFocus
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        disabled={checking}
        placeholder="Go cau tra loi bang tieng Anh..."
        className="mt-6 w-full rounded-2xl border border-stroke bg-white px-5 py-4 text-base font-semibold text-slate-950 outline-none transition focus:border-teal-400 disabled:opacity-60"
      />

      {message ? <p className="mt-3 text-sm font-semibold text-rose-600">{message}</p> : null}

      <button
        type="submit"
        disabled={checking}
        className="btn-brand mt-5 w-full rounded-full px-5 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
      >
        {checking ? 'Dang cham...' : 'Nop cau tra loi'}
      </button>
    </form>
  );
}

function FeedbackCard({
  state,
  question,
  onNext,
}: {
  state: SessionState;
  question: Question;
  onNext: () => void;
}) {
  const fb = state.feedback;
  if (!fb) return null;
  const { result } = fb;

  return (
    <div
      className={[
        'rounded-[2rem] border p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] lg:p-8',
        result.ok ? 'border-emerald-200 bg-emerald-50/60' : 'border-rose-200 bg-rose-50/60',
      ].join(' ')}
    >
      <p className={['text-lg font-extrabold', result.ok ? 'text-emerald-700' : 'text-rose-700'].join(' ')}>
        {result.ok
          ? fb.attempt === 1
            ? 'Chinh xac!'
            : 'Dung roi, cum tu nay da thuoc.'
          : fb.giveUp
            ? 'Chua dung. Cum tu nay tinh la chua thuoc, hay on lai sau.'
            : 'Chua dung. Ban co the on lai cum tu nay o cuoi vong.'}
      </p>

      {result.ok ? (
        <div className="mt-3">
          <p className="text-base font-semibold text-slate-950">{result.matchedText}</p>
          {result.matched > 0 ? (
            <p className="mt-1 text-xs text-slate-600">
              Cach viet cua ban duoc chap nhan. Cum tu chuan: {result.canonical}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <div>
            <DiffLine words={result.diff.typed} badClass="text-rose-600 line-through decoration-2" />
            <p className="text-xs text-slate-500">Ban go</p>
          </div>
          <div>
            <DiffLine words={result.diff.correct} badClass="text-amber-600 underline decoration-2 underline-offset-4" />
            <p className="text-xs text-slate-500">Dap an</p>
          </div>
          {result.otherAnswers.length > 0 ? (
            <p className="text-sm text-slate-600">Cach viet khac cung duoc: {result.otherAnswers.join(' / ')}</p>
          ) : null}
          {result.imeSuspected ? (
            <p className="text-sm font-semibold text-amber-700">
              Co ve bo go tieng Viet dang bat: chuyen sang go tieng Anh (E) roi go lai.
            </p>
          ) : null}
        </div>
      )}

      {result.example ? (
        <div className="mt-4 rounded-2xl border border-stroke bg-white/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Vi du</p>
          <HighlightedLine text={result.example.en} phrase={result.canonical} className="mt-1 text-sm font-medium text-slate-900" />
          <HighlightedLine text={result.example.vi} phrase={question.vi} className="mt-1 text-sm text-slate-600" />
        </div>
      ) : null}

      {result.note ? <p className="mt-3 text-sm text-slate-600">{result.note}</p> : null}

      <button
        type="button"
        onClick={onNext}
        className="btn-brand mt-5 w-full rounded-full px-5 py-3.5 text-sm font-semibold text-white transition"
      >
        {nextButtonLabel(state)}
      </button>
    </div>
  );
}

function RoundEndCard({ state, onReview, onSubmitNow }: { state: SessionState; onReview: () => void; onSubmitNow: () => void }) {
  const ok = state.roundTotal - state.wrong.length;
  const canReview = state.wrong.length > 0 && state.round < state.maxRounds;

  return (
    <div className="rounded-[2rem] border border-stroke bg-white p-6 text-center shadow-[0_18px_55px_rgba(15,23,42,0.06)] lg:p-8">
      <h2 className="text-2xl font-extrabold text-slate-950">Xong vong {state.round}</h2>
      <p className="mt-2 text-sm text-slate-600">
        Dung {ok}/{state.roundTotal}, sai {state.wrong.length} cum.
      </p>

      {canReview ? (
        <>
          <p className="mt-3 text-xs text-slate-500">
            On lai giup ban nho chac hon. Diem "dung ngay lan dau" van tinh theo vong 1.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={onReview} className="btn-brand rounded-full px-5 py-3.5 text-sm font-semibold text-white">
              On lai {state.wrong.length} cum sai (vong {state.round + 1})
            </button>
            <button
              type="button"
              onClick={onSubmitNow}
              className="rounded-full border border-stroke bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition hover:border-teal-300 hover:bg-teal-50"
            >
              Nop va nhan ket qua
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">Con toi da {state.maxRounds - state.round} vong on lai.</p>
        </>
      ) : (
        <button type="button" onClick={onSubmitNow} className="btn-brand mt-6 w-full rounded-full px-5 py-3.5 text-sm font-semibold text-white">
          Nop va nhan ket qua
        </button>
      )}
    </div>
  );
}

function ResultCard({
  state,
  setId,
  questions,
  saveStatus,
  onRetrySave,
  onExit,
  onReviewWrong,
  onNextChapter,
  nextSetLabel,
}: {
  state: SessionState;
  setId: string;
  questions: Question[];
  saveStatus: 'idle' | 'saving' | 'saved' | 'failed';
  onRetrySave: () => void;
  onExit: () => void;
  onReviewWrong: () => void;
  onNextChapter: (() => void) | null;
  nextSetLabel: string | null;
}) {
  const summary = summarize(state);
  const wrongCount = state.wrong.length;

  // Reflects the review schedule as saved to localStorage while the session ran (see
  // use-word-session's `firstAttempt` effect) — computed over the WHOLE set, like the standalone app.
  const nextInfo = useMemo(() => {
    if (state.mode !== 'schedule') return null;
    const progress = loadProgress(state.name, setId);
    const next = nextReviewDay(questions, progress);
    if (next === null || next <= dayIndex()) return null;
    return dayToDate(next).toLocaleDateString('vi-VN');
  }, [state.mode, state.name, setId, questions]);

  const finishedAtLabel = state.finishedAt ? new Date(state.finishedAt).toLocaleString('vi-VN') : '';

  return (
    <div className="rounded-[2rem] border border-stroke bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] lg:p-8">
      <h2 className="text-3xl font-extrabold text-emerald-700">Hoan thanh! Lam tot lam!</h2>
      <p className="mt-2 text-sm text-slate-600">
        {state.name} - {finishedAtLabel} - {state.mode === 'schedule' ? 'On theo lich' : 'Luyen them'}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile value={`${summary.firstOk}/${summary.total}`} label="dung ngay lan dau" />
        <StatTile value={String(summary.rounds)} label="so vong" />
        <StatTile value={String(summary.attempts)} label="tong lan go" />
        <StatTile value={fmtTime(summary.elapsedMs)} label="thoi gian" />
      </div>

      {nextInfo ? <p className="mt-4 text-sm text-slate-600">Lan on tiep theo: {nextInfo}</p> : null}

      <div className="mt-4">
        {saveStatus === 'saving' ? <p className="text-sm text-slate-500">Dang luu diem...</p> : null}
        {saveStatus === 'saved' ? <p className="text-sm font-semibold text-emerald-700">Da luu diem vao bang diem.</p> : null}
        {saveStatus === 'failed' ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-rose-600">Chua luu duoc diem. Ket qua ban lam van duoc giu.</p>
            <button type="button" onClick={onRetrySave} className="rounded-full border border-stroke bg-white px-4 py-2 text-xs font-semibold text-slate-700">
              Thu lai
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-stroke">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Cum tu</th>
              <th className="px-4 py-3">Lan dau</th>
              <th className="px-4 py-3">So lan go</th>
              <th className="px-4 py-3">Cuoi cung</th>
              <th className="px-4 py-3">Thoi gian</th>
            </tr>
          </thead>
          <tbody>
            {summary.rows.map((row) => (
              <tr key={row.n} className="border-t border-stroke/70">
                <td className="px-4 py-2.5 text-slate-500">{row.n}</td>
                <td className={['px-4 py-2.5 font-semibold', row.firstOk ? 'text-emerald-700' : 'text-rose-600'].join(' ')}>
                  {row.firstOk ? 'Dung' : 'Sai'}
                </td>
                <td className="px-4 py-2.5 text-slate-700">{row.attempts}</td>
                <td className={['px-4 py-2.5 font-semibold', row.mastered ? 'text-emerald-700' : 'text-rose-600'].join(' ')}>
                  {row.mastered ? 'Da thuoc' : 'Chua thuoc'}
                </td>
                <td className="px-4 py-2.5 text-slate-700">{fmtTime(row.ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {wrongCount > 0 ? (
          <button
            type="button"
            onClick={onReviewWrong}
            className="btn-brand rounded-full px-5 py-3.5 text-sm font-semibold text-white"
          >
            On lai {wrongCount} cum chua thuoc
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-semibold text-emerald-700">
            <CheckIcon />
            Da thuoc het bo nay
          </div>
        )}

        {onNextChapter ? (
          <button
            type="button"
            onClick={onNextChapter}
            className="rounded-full border border-stroke bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition hover:border-teal-300 hover:bg-teal-50"
          >
            On tiep {nextSetLabel}
          </button>
        ) : null}
      </div>

      <button type="button" onClick={onExit} className="mt-3 rounded-full border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-800">
        Quay lai chon bo
      </button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5 9.5 17 19 7" />
    </svg>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4 text-center">
      <p className="text-2xl font-extrabold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

export function WordSessionView({
  session,
  setId,
  questions,
  onExit,
  onReviewWrong,
  onNextChapter,
  nextSetLabel,
}: {
  session: ReturnType<typeof useWordSession>;
  setId: string;
  questions: Question[];
  onExit: () => void;
  onReviewWrong: (wrongIdx: number[]) => void;
  onNextChapter: (() => void) | null;
  nextSetLabel: string | null;
}) {
  const { state, message, saveStatus, submit, next, review, submitNow, retrySave } = session;
  const question = questions[state.cur];

  if (state.phase === 'finished') {
    return (
      <ResultCard
        state={state}
        setId={setId}
        questions={questions}
        saveStatus={saveStatus}
        onRetrySave={retrySave}
        onExit={onExit}
        onReviewWrong={() => onReviewWrong(state.wrong)}
        onNextChapter={onNextChapter}
        nextSetLabel={nextSetLabel}
      />
    );
  }

  if (state.phase === 'roundEnd') {
    return <RoundEndCard state={state} onReview={review} onSubmitNow={submitNow} />;
  }

  if (!question) return null;

  if (state.phase === 'feedback') {
    return <FeedbackCard state={state} question={question} onNext={next} />;
  }

  return <QuizCard state={state} question={question} message={message} onSubmit={submit} />;
}
