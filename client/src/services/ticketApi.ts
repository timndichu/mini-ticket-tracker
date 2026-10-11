
import type {
  CreateTicketInput,
  Ticket,
  TicketListResponse,
  TicketStats,
  TicketStatus,
  UpdateTicketInput,
} from "../types/ticket";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/+$/, "");

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    const message =
      body?.error ?? `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export interface ListTicketsParams {
  status?: TicketStatus;
  page?: number;
  limit?: number;
}

export async function getTickets(
  params: ListTicketsParams = {}
): Promise<TicketListResponse> {
  const query = new URLSearchParams();

  if (params.status) query.set("status", params.status);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.limit !== undefined) query.set("limit", String(params.limit));

  const queryString = query.toString();

  return apiRequest<TicketListResponse>(
    `/tickets${queryString ? `?${queryString}` : ""}`
  );
}

export async function createTicket(
  input: CreateTicketInput
): Promise<Ticket> {
  return apiRequest<Ticket>("/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTicket(
  id: number,
  input: UpdateTicketInput
): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function getTicketStats(): Promise<TicketStats> {
  return apiRequest<TicketStats>("/tickets/stats");
}
