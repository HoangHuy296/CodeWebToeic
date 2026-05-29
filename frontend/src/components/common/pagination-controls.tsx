interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  itemLabel,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-col gap-3 rounded-[1.6rem] border border-stroke bg-white px-4 py-4 shadow-[0_12px_36px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-600">
        Hien thi <span className="font-bold text-slate-900">{start}-{end}</span> /{' '}
        <span className="font-bold text-slate-900">{totalItems}</span> {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-full border border-stroke px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Truoc
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={[
                'h-10 min-w-10 rounded-full px-3 text-sm font-semibold transition',
                page === currentPage
                  ? 'bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]'
                  : 'border border-stroke bg-white text-slate-700 hover:bg-slate-50',
              ].join(' ')}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-full border border-stroke px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
