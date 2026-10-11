import type { TicketPriority } from "../../types/ticket";

interface PriorityBadgeProps {
  priority: TicketPriority;
}

const priorityStyles: Record<TicketPriority, string> = {
  low: "text-emerald-700",
  medium: "text-amber-700",
  high: "text-red-700",
};

function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm font-semibold ${priorityStyles[priority]}`}
    >
      <span className="size-2 rounded-full bg-current" />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

export default PriorityBadge;
