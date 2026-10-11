import { useState, type FormEvent } from "react";
import { createTicket } from "../../services/ticketApi";
import type { TicketPriority } from "../../types/ticket";

interface CreateTicketFormProps {
  onCreated: () => void;
  onCancel: () => void;
}

function CreateTicketForm({ onCreated, onCancel }: CreateTicketFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Please enter a ticket title.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createTicket({
        title: trimmedTitle,
        description: description.trim() || undefined,
        priority,
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      onCreated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create ticket. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">Create a ticket</h2>
        <p className="mt-1 text-sm text-slate-500">
          Report an issue for the support team to handle.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="ticket-title"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Title <span className="text-red-600">*</span>
          </label>
          <input
            id="ticket-title"
            name="title"
            type="text"
            required
            maxLength={200}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Unable to log in"
            disabled={submitting}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label
            htmlFor="ticket-description"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Description
          </label>
          <textarea
            id="ticket-description"
            name="description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the issue (optional)"
            disabled={submitting}
            className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label
            htmlFor="ticket-priority"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Priority
          </label>
          <select
            id="ticket-priority"
            name="priority"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as TicketPriority)
            }
            disabled={submitting}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 sm:max-w-xs"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create ticket"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export default CreateTicketForm;
