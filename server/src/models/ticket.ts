export type TicketStatus = "open" | "in_progress" | "closed";

export type TicketPriority = "low" | "medium" | "high";

export interface Ticket {

  //id is a string because PostgreSQL's BIGINT values are returned as strings by default by the pg driver.  
  id: string; 
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: Date;
}
