import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { getApiErrorMessage } from '../../lib/api';
import { formatDateTime } from '../../lib/format';
import { mockTestApi } from '../../lib/mock-test-api';

interface WorkspaceMockTestResultsPageProps {
  audience: 'student' | 'teacher' | 'admin';
}

function formatDurationSeconds(value: number) {
  if (!value) {
    return 'Chua ghi nhan';
  }

  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  if (!minutes) {
    return `${seconds} giay`;
  }
  return `${minutes} phut ${seconds.toString().padStart(2, '0')} giay`;
}

export function WorkspaceMockTestResultsPage({ audience }: WorkspaceMockTestResultsPageProps) {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'assigned' | 'free'>('all');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  const submissionsQuery = useQuery({
    queryKey: ['mock-tests', 'submissions', audience],
    queryFn: mockTestApi.submissions,
  });

  const filteredSubmissions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (submissionsQuery.data ?? []).filter((submission) => {
      const matchesSource = sourceFilter === 'all' || submission.sourceKind === sourceFilter;
      const haystack = [
        submission.mockTest.title,
        submission.creator.fullName,
        submission.student.fullName,
        submission.student.email,
        ...submission.assignedCourses.map((course) => course.title),
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !keyword || haystack.includes(keyword);
      return matchesSource && matchesSearch;
    });
  }, [search, sourceFilter, submissionsQuery.data]);

  useEffect(() => {
    if (!filteredSubmissions.length) {
      setSelectedSubmissionId(null);
      return;
    }

    if (!selectedSubmissionId || !filteredSubmissions.some((item) => item.id === selectedSubmissionId)) {
      setSelectedSubmissionId(filteredSubmissions[0].id);
    }
  }, [filteredSubmissions, selectedSubmissionId]);

  const selectedSummary = filteredSubmissions.find((item) => item.id === selectedSubmissionId) ?? null;

  const submissionDetailQuery = useQuery({
    queryKey: ['mock-tests', 'submission-detail', selectedSubmissionId, audience],
    queryFn: () => mockTestApi.submissionDetail(selectedSubmissionId as string),
    enabled: Boolean(selectedSubmissionId),
  });

  const totalSubmissions = filteredSubmissions.length;
  const averageScore =
    totalSubmissions > 0
      ? Math.round(filteredSubmissions.reduce((sum, submission) => sum + submission.score, 0) / totalSubmissions)
      : 0;
  const strongAttempts = filteredSubmissions.filter((submission) => submission.score >= 80).length;

  const heroContent =
    audience === 'admin'
      ? {
          eyebrow: 'score workspace',
          title: 'Bang diem bai on tap va luyen thi',
          description:
            'Admin co the xem diem tung bai lam, nguon de, hoc vien, giang vien tao de va nhung khoa hoc duoc gan vao de do.',
        }
      : audience === 'teacher'
        ? {
            eyebrow: 'teacher scorebook',
            title: 'Ket qua bai lam theo de va khoa hoc cua giang vien',
            description:
              'Giang vien co the theo doi diem tung bai on tap va bai luyen thi do minh tao, biet hoc vien nao da nop bai va de dang gan voi khoa hoc nao.',
          }
        : {
            eyebrow: 'student scorebook',
            title: 'Ket qua bai lam cua ban theo tung de va giang vien',
            description:
              'Hoc vien co the xem lai diem cua bai on tap va bai luyen thi, biet de do do giang vien nao tao va dang gan voi khoa hoc nao minh dang hoc.',
          };

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow={heroContent.eyebrow}
        title={heroContent.title}
        description={heroContent.description}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.7rem] border border-stroke bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">Tong bai da cham</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{totalSubmissions}</p>
        </article>
        <article className="rounded-[1.7rem] border border-stroke bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">Diem trung binh</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{averageScore}/100</p>
        </article>
        <article className="rounded-[1.7rem] border border-stroke bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">Bai dat 80+</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{strongAttempts}</p>
        </article>
      </section>

      <section className="rounded-[1.8rem] border border-stroke bg-white/90 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Tim theo de, giang vien, hoc vien hoac khoa hoc</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                audience === 'admin'
                  ? 'VD: teacher, student, TOEIC...'
                  : audience === 'teacher'
                    ? 'VD: hoc vien, de reading, khoa hoc...'
                    : 'VD: de reading, co Lan, khoa hoc...'
              }
              className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none focus:border-cyan-500"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Nguon de</span>
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value as 'all' | 'assigned' | 'free')}
              className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none focus:border-cyan-500"
            >
              <option value="all">Tat ca</option>
              <option value="assigned">De gan khoa hoc</option>
              <option value="free">De tu do</option>
            </select>
          </label>
        </div>
      </section>

      {submissionsQuery.isPending ? <QueryLoadingState title="Dang tai bang diem..." /> : null}
      {submissionsQuery.error ? (
        <QueryErrorState title="Khong tai duoc bang diem" description={getApiErrorMessage(submissionsQuery.error)} />
      ) : null}

      <section className="grid items-start gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-4">
          {filteredSubmissions.map((submission) => {
            const isActive = submission.id === selectedSubmissionId;
            return (
              <button
                key={submission.id}
                type="button"
                onClick={() => setSelectedSubmissionId(submission.id)}
                className={[
                  'rounded-[1.8rem] border px-5 py-5 text-left transition',
                  isActive
                    ? 'border-cyan-200 bg-cyan-50/80 shadow-[0_18px_42px_rgba(14,165,233,0.12)]'
                    : 'border-stroke bg-white/90 shadow-[0_16px_40px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:border-cyan-100',
                ].join(' ')}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                    {submission.mockTest.type}
                  </span>
                  <span
                    className={[
                      'rounded-full px-3 py-1 text-xs font-bold',
                      submission.score >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : submission.score >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800',
                    ].join(' ')}
                  >
                    {submission.score}/100
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-black tracking-tight text-slate-950">{submission.mockTest.title}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {audience === 'admin' ? `${submission.student.fullName} · ` : ''}
                  {submission.creator.fullName} · {formatDateTime(submission.submittedAt)}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                    {submission.correctAnswers}/{submission.totalQuestions} cau dung
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                    {submission.sourceKind === 'assigned' ? 'De gan khoa hoc' : 'De tu do'}
                  </span>
                </div>

                {submission.assignedCourses.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {submission.assignedCourses.slice(0, 2).map((course) => (
                      <span key={course.id} className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-900">
                        {course.title}
                      </span>
                    ))}
                  </div>
                ) : null}
              </button>
            );
          })}

          {!submissionsQuery.isPending && filteredSubmissions.length === 0 ? (
            <div className="rounded-[1.8rem] border border-dashed border-stroke bg-white/80 px-6 py-10 text-sm text-slate-500">
              Chua co bai lam nao phu hop voi bo loc hien tai.
            </div>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-stroke bg-white/92 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
          {!selectedSubmissionId ? (
            <div className="rounded-[1.5rem] border border-dashed border-stroke px-5 py-12 text-center text-sm text-slate-500">
              Chon mot bai lam o cot ben trai de xem chi tiet diem.
            </div>
          ) : submissionDetailQuery.isPending ? (
            <QueryLoadingState title="Dang tai chi tiet bai lam..." />
          ) : submissionDetailQuery.error ? (
            <QueryErrorState title="Khong tai duoc chi tiet bai lam" description={getApiErrorMessage(submissionDetailQuery.error)} />
          ) : submissionDetailQuery.data ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
                    {selectedSummary?.creator.role === 'teacher' ? 'de cua giang vien' : 'de he thong'}
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                    {submissionDetailQuery.data.mockTest.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {submissionDetailQuery.data.creator.fullName}
                    {' · '}
                    {formatDateTime(submissionDetailQuery.data.submittedAt)}
                  </p>
                </div>

                <div className="rounded-[1.4rem] bg-[linear-gradient(135deg,rgba(8,145,178,0.12),rgba(37,99,235,0.08))] px-5 py-4 text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">Diem so</p>
                  <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                    {submissionDetailQuery.data.score}/100
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-stroke bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Dung / Tong</p>
                  <p className="mt-2 text-xl font-black text-slate-950">
                    {submissionDetailQuery.data.correctAnswers}/{submissionDetailQuery.data.totalQuestions}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-stroke bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Thoi gian lam bai</p>
                  <p className="mt-2 text-xl font-black text-slate-950">
                    {formatDurationSeconds(submissionDetailQuery.data.durationSeconds)}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-stroke bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Nguon</p>
                  <p className="mt-2 text-xl font-black text-slate-950">
                    {selectedSummary?.sourceKind === 'assigned' ? 'Gan khoa hoc' : 'De tu do'}
                  </p>
                </div>
              </div>

              {submissionDetailQuery.data.assignedCourses.length ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Khoa hoc lien quan</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {submissionDetailQuery.data.assignedCourses.map((course) => (
                      <span key={course.id} className="rounded-full bg-cyan-100 px-3 py-2 text-xs font-semibold text-cyan-900">
                        {course.title} · {course.ownerName}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Review tung cau</p>
                {submissionDetailQuery.data.review.map((item, index) => (
                  <article key={item.questionId} className="rounded-[1.4rem] border border-stroke bg-white px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-bold text-slate-950">Cau {index + 1}</p>
                      <span
                        className={[
                          'rounded-full px-3 py-1 text-xs font-semibold',
                          item.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
                        ].join(' ')}
                      >
                        {item.isCorrect ? 'Dung' : 'Can xem lai'}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-700">{item.prompt}</p>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold text-slate-900">Lua chon cua ban:</span> {item.selectedOption || 'Bo trong'}
                      </p>
                      {'correctAnswer' in item ? (
                        <p>
                          <span className="font-semibold text-slate-900">Dap an dung:</span>{' '}
                          {((item as { correctAnswer?: string }).correctAnswer) ?? 'An cho hoc vien'}
                        </p>
                      ) : null}
                      {item.explanation ? (
                        <p>
                          <span className="font-semibold text-slate-900">Giai thich:</span> {item.explanation}
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
