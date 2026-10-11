import type { TicketStatus } from "../../types/ticket";

type StatusFilter = TicketStatus | "all";

interface TicketFiltersProps {
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
}

function TicketFilters({
  statusFilter,
  onStatusChange,
}: TicketFiltersProps) {
  return (
    <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
      <span>Status</span>
      <select
        value={statusFilter}
        onChange={(event) =>
          onStatusChange(event.target.value as StatusFilter)
        }
        className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        <option value="all">All statuses</option>
        <option value="open">Open</option>
        <option value="in_progress">In progress</option>
        <option value="closed">Closed</option>
      </select>
    </label>
  );
}

export default TicketFilters;