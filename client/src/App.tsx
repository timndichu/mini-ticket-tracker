import { useEffect, useState } from "react";
import { getTickets, getTicketStats } from "./services/ticketApi";
import type { Ticket, TicketStats, TicketStatus } from "./types/ticket";
import TicketStatsSection from "./components/dashboard/TicketStatsSection";
import StatusBadge from "./components/ui/StatusBadge";
import PriorityBadge from "./components/ui/PriorityBadge";

type StatusFilter = "all" | TicketStatus;

const PAGE_SIZE = 10;

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

const priorityStyles = {
  low: "text-emerald-700",
  medium: "text-amber-700",
  high: "text-red-700",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);

  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const [ticketsError, setTicketsError] = useState("");
  const [statsError, setStatsError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadTickets() {
      setLoadingTickets(true);
      setTicketsError("");

      try {
        const result = await getTickets({
          status: statusFilter === "all" ? undefined : statusFilter,
          page,
          limit: PAGE_SIZE,
        });

        if (cancelled) return;

        setTickets(result.data);
        setTotalTickets(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
      } catch (error) {
        if (cancelled) return;

        setTicketsError(
          error instanceof Error ? error.message : "Unable to load tickets.",
        );
      } finally {
        if (!cancelled) setLoadingTickets(false);
      }
    }

    void loadTickets();

    return () => {
      cancelled = true;
    };
  }, [statusFilter, page, refreshKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setLoadingStats(true);
      setStatsError("");

      try {
        const result = await getTicketStats();

        if (!cancelled) setStats(result);
      } catch (error) {
        if (cancelled) return;

        setStatsError(
          error instanceof Error
            ? error.message
            : "Unable to load ticket statistics.",
        );
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    }

    void loadStats();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  function refreshDashboard() {
    setRefreshKey((current) => current + 1);
  }

  function handleFilterChange(value: StatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  const statCards = [
    {
      label: "All tickets",
      value: stats ? stats.open + stats.in_progress + stats.closed : "—",
      description: "Across all statuses",
      icon: "▤",
      iconStyle: "bg-blue-50 text-blue-700",
    },
    {
      label: "Open",
      value: stats?.open ?? "—",
      description: "Waiting to be handled",
      icon: "○",
      iconStyle: "bg-amber-50 text-amber-700",
    },
    {
      label: "In progress",
      value: stats?.in_progress ?? "—",
      description: "Currently being worked on",
      icon: "◷",
      iconStyle: "bg-violet-50 text-violet-700",
    },
    {
      label: "Closed",
      value: stats?.closed ?? "—",
      description: "Successfully resolved",
      icon: "✓",
      iconStyle: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-800 text-lg font-bold text-white">
              T
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              TicketDesk
            </span>
          </a>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
              <span className="size-2 rounded-full bg-emerald-500" />
              Support workspace
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
              T
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Workspace / Tickets
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Ticket overview
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Track, prioritize, and manage support requests.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshDashboard}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span aria-hidden="true" className="text-lg">
              ↻
            </span>
            Refresh
          </button>
        </section>

        <div className="mb-8">
          <TicketStatsSection stats={stats} loading={loadingStats} />
        </div>

        {statsError && (
          <div
            role="alert"
            className="mb-5 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>Unable to load statistics: {statsError}</span>
            <button
              type="button"
              onClick={refreshDashboard}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Support tickets
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {totalTickets} {totalTickets === 1 ? "ticket" : "tickets"}
                {statusFilter !== "all"
                  ? ` · ${statusLabels[statusFilter]}`
                  : " · All statuses"}
              </p>
            </div>

            <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  handleFilterChange(event.target.value as StatusFilter)
                }
                className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          </div>

          {ticketsError && (
            <div
              role="alert"
              className="flex items-center justify-between gap-4 border-b border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <span>{ticketsError}</span>
              <button
                type="button"
                onClick={refreshDashboard}
                className="shrink-0 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-6 py-4">
                    Ticket
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loadingTickets ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-16 text-center text-sm text-slate-500"
                    >
                      Loading tickets...
                    </td>
                  </tr>
                ) : ticketsError ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-16 text-center text-sm text-slate-500"
                    >
                      Tickets could not be displayed.
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <span className="mb-3 grid size-12 place-items-center rounded-xl bg-slate-100 text-xl text-slate-500">
                          ▤
                        </span>
                        <p className="font-semibold text-slate-800">
                          No tickets found
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Try another status filter or create a ticket.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket: Ticket) => (
                    <tr
                      key={ticket.id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="max-w-md px-6 py-5">
                        <p className="break-word text-sm font-semibold text-slate-800">
                          {ticket.title}
                        </p>
                        <p className="mt-1 break-word text-xs leading-5 text-slate-500">
                          {ticket.description || "No description provided"}
                        </p>
                        <p className="mt-2 text-xs font-medium text-slate-400">
                          TKT-{ticket.id}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                       <StatusBadge status={ticket.status} />
                      </td>

                      <td className="px-6 py-5">
                       <PriorityBadge priority={ticket.priority} />
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-500">
                        {formatDate(ticket.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-slate-500">
              Page {page} of {Math.max(totalPages, 1)}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || loadingTickets}
                onClick={() => setPage((current) => current - 1)}
                className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={
                  loadingTickets || totalPages === 0 || page >= totalPages
                }
                onClick={() => setPage((current) => current + 1)}
                className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </footer>
        </section>

        <footer className="py-6 text-center text-xs text-slate-400">
          Mini Ticket Tracker · Support workspace
        </footer>
      </main>
    </div>
  );
}

export default App;
