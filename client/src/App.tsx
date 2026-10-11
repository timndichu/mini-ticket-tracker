
import { useEffect, useState } from "react";
import {
  getTickets,
  getTicketStats,
} from "./services/ticketApi";
import type {
  Ticket,
  TicketStats,
  TicketStatus,
} from "./types/ticket";
import "./App.css";
import TicketStatsSection from "./components/dashboard/TicketStatsSection";

type StatusFilter = "all" | TicketStatus;

const PAGE_SIZE = 10;

const statusLabels: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);

  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [ticketsError, setTicketsError] = useState("");
  const [statsError, setStatsError] = useState("");

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
          error instanceof Error
            ? error.message
            : "Unable to load tickets."
        );
      } finally {
        if (!cancelled) setLoadingTickets(false);
      }
    }

    void loadTickets();

    return () => {
      cancelled = true;
    };
  }, [statusFilter, page]);

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
            : "Unable to load ticket statistics."
        );
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    }

    void loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleStatusFilterChange(value: StatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  function refreshDashboard() {
    // Reloading the page is not necessary; changing a state value
    // would be another option. We'll add a dedicated refresh trigger
    // when we wire in ticket creation and updates.
    window.location.reload();
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="brand" href="/" aria-label="TicketDesk home">
          <span className="brand-mark">T</span>
          <span>TicketDesk</span>
        </a>

        <div className="topbar-right">
          <span className="environment-label">
            <span className="environment-dot" />
            Support workspace
          </span>
          <div className="avatar" aria-label="User">T</div>
        </div>
      </header>

      <section className="page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">WORKSPACE / TICKETS</p>
            <h1>Ticket overview</h1>
            <p className="page-description">
              Track, prioritize, and manage support requests.
            </p>
          </div>

          <button
            className="button button-secondary"
            type="button"
            onClick={refreshDashboard}
          >
            <span aria-hidden="true">↻</span>
            Refresh
          </button>
        </div>

        <TicketStatsSection stats={stats} loading={loadingStats} />

        {statsError && (
          <div className="alert alert-error" role="alert">
            Statistics could not be loaded: {statsError}
          </div>
        )}

        <section className="tickets-panel">
          <div className="panel-heading">
            <div>
              <h2>Support tickets</h2>
              <p className="panel-description">
                {totalTickets} {totalTickets === 1 ? "ticket" : "tickets"}
                {statusFilter !== "all"
                  ? ` · ${statusLabels[statusFilter]}`
                  : " · All statuses"}
              </p>
            </div>

            <label className="filter-control">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  handleStatusFilterChange(
                    event.target.value as StatusFilter
                  )
                }
              >
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          </div>

          {ticketsError && (
            <div className="alert alert-error" role="alert">
              <p>{ticketsError}</p>
              <button
                className="text-button"
                onClick={() => setPage((current) => current)}
                type="button"
              >
                Try again
              </button>
            </div>
          )}

          <div className="table-wrapper">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {loadingTickets ? (
                  <tr>
                    <td className="table-message" colSpan={4}>
                      Loading tickets...
                    </td>
                  </tr>
                ) : ticketsError ? (
                  <tr>
                    <td className="table-message" colSpan={4}>
                      Unable to display tickets.
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td className="table-message" colSpan={4}>
                      <div className="empty-state">
                        <span className="empty-icon">▤</span>
                        <strong>No tickets found</strong>
                        <span>
                          Try another status filter or create a ticket.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <div className="ticket-title">
                          {ticket.title}
                        </div>
                        <div className="ticket-description">
                          {ticket.description || "No description provided"}
                        </div>
                        <span className="ticket-id">
                          TKT-{ticket.id}
                        </span>
                      </td>

                      <td>
                        <span className={`status-badge status-${ticket.status}`}>
                          <span className="status-dot" />
                          {statusLabels[ticket.status]}
                        </span>
                      </td>

                      <td>
                        <span className={`priority priority-${ticket.priority}`}>
                          <span className="priority-dot" />
                          {ticket.priority.charAt(0).toUpperCase() +
                            ticket.priority.slice(1)}
                        </span>
                      </td>

                      <td className="date-cell">
                        {formatDate(ticket.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <footer className="pagination">
            <span className="pagination-info">
              Page {page} of {Math.max(totalPages, 1)}
            </span>

            <div className="pagination-actions">
              <button
                className="button button-secondary"
                type="button"
                disabled={page <= 1 || loadingTickets}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>
              <button
                className="button button-secondary"
                type="button"
                disabled={
                  loadingTickets ||
                  totalPages === 0 ||
                  page >= totalPages
                }
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          </footer>
        </section>

        <p className="page-footer">
          TicketDesk · Mini Ticket Tracker
        </p>
      </section>
    </main>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  detail: string;
  icon: string;
  tone: "blue" | "orange" | "purple" | "green";
}

function StatCard({
  label,
  value,
  detail,
  icon,
  tone,
}: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon stat-icon-${tone}`} aria-hidden="true">
          {icon}
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <p className="stat-detail">{detail}</p>
    </article>
  );
}

export default App;
