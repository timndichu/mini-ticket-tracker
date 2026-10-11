interface PaginationProps {
  page: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (updater: (current: number) => number) => void;
}

function Pagination({
  page,
  totalPages,
  loading,
  onPageChange,
}: PaginationProps) {
  return (
    <footer className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm text-slate-500">
        Page {page} of {Math.max(totalPages, 1)}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange((current) => current - 1)}
          className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={loading || totalPages === 0 || page >= totalPages}
          onClick={() => onPageChange((current) => current + 1)}
          className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </footer>
  );
}

export default Pagination;