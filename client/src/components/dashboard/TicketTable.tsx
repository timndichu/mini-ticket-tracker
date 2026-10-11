import type { Ticket } from "../../types/ticket";
import StatusBadge from "../ui/StatusBadge";
import PriorityBadge from "../ui/PriorityBadge";

interface TicketTableProps {
  tickets: Ticket[];
  loading: boolean;
}

function TicketTable({ tickets, loading }: TicketTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-175 text-left">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ticket
            </th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Priority
            </th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Status
            </th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Created
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-12 text-center text-sm text-slate-500"
              >
                Loading tickets...
              </td>
            </tr>
          ) : tickets.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-12 text-center text-sm text-slate-500"
              >
                No tickets found.
              </td>
            </tr>
          ) : (
            tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">
                    {ticket.title}
                  </div>
                  <div className="mt-1 max-w-md truncate text-sm text-slate-500">
                    {ticket.description || "No description provided"}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    ID: {ticket.id}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <PriorityBadge priority={ticket.priority} />
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={ticket.status} />
                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TicketTable;