
import type { TicketStats as TicketStatsData } from "../../types/ticket";

interface TicketStatsProps {
  stats: TicketStatsData | null;
  loading: boolean;
}

function TicketStats({ stats, loading }: TicketStatsProps) {
  const cards = [
    {
      label: "All tickets",
      value: stats
        ? stats.open + stats.in_progress + stats.closed
        : 0,
      description: "Across all statuses",
      icon: "▤",
      iconStyle: "bg-blue-50 text-blue-700",
    },
    {
      label: "Open",
      value: stats?.open ?? 0,
      description: "Waiting to be handled",
      icon: "○",
      iconStyle: "bg-amber-50 text-amber-700",
    },
    {
      label: "In progress",
      value: stats?.in_progress ?? 0,
      description: "Currently being worked on",
      icon: "◷",
      iconStyle: "bg-violet-50 text-violet-700",
    },
    {
      label: "Closed",
      value: stats?.closed ?? 0,
      description: "Successfully resolved",
      icon: "✓",
      iconStyle: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <section
      aria-label="Ticket statistics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-slate-500">
              {card.label}
            </h2>

            <span
              aria-hidden="true"
              className={`grid size-10 place-items-center rounded-xl text-xl ${card.iconStyle}`}
            >
              {card.icon}
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            {loading ? "—" : stats ? card.value : "—"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {card.description}
          </p>
        </article>
      ))}
    </section>
  );
}

export default TicketStats;
