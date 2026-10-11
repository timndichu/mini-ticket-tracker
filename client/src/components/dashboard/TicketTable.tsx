import { useState } from "react";
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
  UpdateTicketInput,
} from "../../types/ticket";
import StatusBadge from "../ui/StatusBadge";
import PriorityBadge from "../ui/PriorityBadge";

interface TicketTableProps {
  tickets: Ticket[];
  loading: boolean;
  updatingTicketId: number | null;
  onUpdate: (ticketId: number, input: UpdateTicketInput) => Promise<void>;
}

function TicketTable({
  tickets,
  loading,
  updatingTicketId,
  onUpdate,
}: TicketTableProps) {
  const [editingTicketId, setEditingTicketId] = useState<number | null>(null);
  const [draftStatus, setDraftStatus] = useState<TicketStatus>("open");
  const [draftPriority, setDraftPriority] =
    useState<TicketPriority>("medium");
  const [editError, setEditError] = useState<string | null>(null);

  function startEditing(ticket: Ticket) {
    setEditingTicketId(ticket.id);
    setDraftStatus(ticket.status);
    setDraftPriority(ticket.priority);
    setEditError(null);
  }

  function cancelEditing() {
    setEditingTicketId(null);
    setEditError(null);
  }

  async function saveChanges(ticket: Ticket) {
    const changes: UpdateTicketInput = {};

    if (draftStatus !== ticket.status) {
      changes.status = draftStatus;
    }

    if (draftPriority !== ticket.priority) {
      changes.priority = draftPriority;
    }

    if (Object.keys(changes).length === 0) {
      cancelEditing();
      return;
    }

    setEditError(null);

    try {
      await onUpdate(ticket.id, changes);
      setEditingTicketId(null);
    } catch (error) {
      setEditError(
        error instanceof Error
          ? error.message
          : "Failed to update ticket. Please try again."
      );
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left">
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
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-12 text-center text-sm text-slate-500"
              >
                Loading tickets...
              </td>
            </tr>
          ) : tickets.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-12 text-center text-sm text-slate-500"
              >
                No tickets found.
              </td>
            </tr>
          ) : (
            tickets.map((ticket) => {
              const isEditing = editingTicketId === ticket.id;
              const isUpdating = updatingTicketId === ticket.id;

              return (
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
                    {isEditing ? (
                      <select
                        aria-label={`Priority for ticket ${ticket.id}`}
                        value={draftPriority}
                        onChange={(event) =>
                          setDraftPriority(
                            event.target.value as TicketPriority
                          )
                        }
                        disabled={isUpdating}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    ) : (
                      <PriorityBadge priority={ticket.priority} />
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {isEditing ? (
                      <select
                        aria-label={`Status for ticket ${ticket.id}`}
                        value={draftStatus}
                        onChange={(event) =>
                          setDraftStatus(event.target.value as TicketStatus)
                        }
                        disabled={isUpdating}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="closed">Closed</option>
                      </select>
                    ) : (
                      <StatusBadge status={ticket.status} />
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void saveChanges(ticket)}
                          disabled={isUpdating}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUpdating ? "Saving..." : "Save"}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={isUpdating}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditing(ticket)}
                        disabled={updatingTicketId !== null}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>
                    )}

                    {isEditing && editError && (
                      <p
                        role="alert"
                        className="mt-2 max-w-48 text-xs text-red-600"
                      >
                        {editError}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TicketTable;