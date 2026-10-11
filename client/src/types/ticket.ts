
export type TicketStatus = "open" | "in_progress" | "closed";

export type TicketPriority = "low" | "medium" | "high";

export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
}

export interface CreateTicketInput {
  title: string;
  description?: string;
  priority?: TicketPriority;
}

export interface UpdateTicketInput {
  status?: TicketStatus;
  priority?: TicketPriority;
}

export interface TicketPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TicketListResponse {
  data: Ticket[];
  pagination: TicketPagination;
}

export interface TicketStats {
  open: number;
  in_progress: number;
  closed: number;
}
