import type { TicketStatus } from "../../types/ticket";

interface StatusBadgeProps {
  status: TicketStatus;
}

const statusLabels: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
};

const statusStyles: Record<TicketStatus, string> = {
  open: "bg-amber-50 text-amber-700 ring-amber-600/20",
  in_progress: "bg-violet-50 text-violet-700 ring-violet-600/20",
  closed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export default StatusBadge;