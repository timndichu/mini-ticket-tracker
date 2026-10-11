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
      className={`text-sm font-semibold capitalize ${priorityStyles[priority]}`}
    >
      {priority}
    </span>
  );
}

export default PriorityBadge;