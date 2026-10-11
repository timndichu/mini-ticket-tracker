import { useEffect, useState } from "react";
import { getTickets, getTicketStats, updateTicket } from "./services/ticketApi";
import type { Ticket, TicketStats, TicketStatus, UpdateTicketInput } from "./types/ticket";
import TicketStatsSection from "./components/dashboard/TicketStatsSection";
import TicketTable from "./components/dashboard/TicketTable";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import TicketFilters from "./components/dashboard/TicketFilters";
import Pagination from "./components/dashboard/Pagination";
import CreateTicketForm from "./components/dashboard/CreateTicketForm";

type StatusFilter = "all" | TicketStatus;

const PAGE_SIZE = 10;

const statusLabels: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
};

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

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const [updatingTicketId, setUpdatingTicketId] = useState<number | null>(null);

  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(
    null,
  );

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

  function handleTicketCreated() {
    setStatusFilter("all");
    setPage(1);
    refreshDashboard();
  }

  function handleFilterChange(value: StatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  async function handleTicketUpdate(
  ticketId: number,
  changes: UpdateTicketInput
): Promise<void> {
  setUpdatingTicketId(ticketId);
  setStatusUpdateError(null);

  try {
    await updateTicket(ticketId, changes);
    refreshDashboard();
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to update ticket.";

    setStatusUpdateError(message);
    throw new Error(message);
  } finally {
    setUpdatingTicketId(null);
  }
}

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <DashboardHeader />

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
          <div className="mb-8 flex justify-end">
            {!isCreateFormOpen && (
              <button
                type="button"
                onClick={() => setIsCreateFormOpen(true)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <span aria-hidden="true">+</span>
                Create ticket
              </button>
            )}
          </div>

          {isCreateFormOpen && (
            <div className="mb-8">
              <CreateTicketForm
                onCreated={() => {
                  setIsCreateFormOpen(false);
                  handleTicketCreated();
                }}
                onCancel={() => setIsCreateFormOpen(false)}
              />
            </div>
          )}
        </div>

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

            <TicketFilters
              statusFilter={statusFilter}
              onStatusChange={handleFilterChange}
            />
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

          {statusUpdateError && (
            <p role="alert" className="px-5 py-3 text-sm text-red-600 sm:px-6">
              {statusUpdateError}
            </p>
          )}

          <TicketTable
            tickets={tickets}
            loading={loadingTickets}
            updatingTicketId={updatingTicketId}
            onUpdate={handleTicketUpdate}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            loading={loadingTickets}
            onPageChange={setPage}
          />
        </section>

        <footer className="py-6 text-center text-xs text-slate-400">
          Mini Ticket Tracker · Support workspace
        </footer>
      </main>
    </div>
  );
}

export default App;
