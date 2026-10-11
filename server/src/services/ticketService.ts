
import { db } from "../db/index.js";
import { tickets } from "../db/schema.js";
import type { CreateTicketInput, UpdateTicketInput } from "../schemas/ticketSchema.js";
import { count, desc, eq } from "drizzle-orm";
import type { ListTicketsQuery } from "../schemas/ticketSchema.js";


export async function createTicket(input: CreateTicketInput) {
  const [ticket] = await db
    .insert(tickets)
    .values({
      title: input.title,
      description: input.description ?? null,
      status: input.status,
      priority: input.priority,
    })
    .returning();

  return ticket;
}


export async function listTickets(filters: ListTicketsQuery) {
  const offset = (filters.page - 1) * filters.limit;

  //allows us to build the query conditionally
  const ticketQuery = db.select().from(tickets).$dynamic();

  const countQuery = db
    .select({ total: count() })
    .from(tickets)
    .$dynamic();

  if (filters.status) {
    const condition = eq(tickets.status, filters.status);

    ticketQuery.where(condition);
    countQuery.where(condition);
  }

  const [data, countResult] = await Promise.all([
    ticketQuery
      .orderBy(desc(tickets.createdAt), desc(tickets.id))
      .limit(filters.limit)
      .offset(offset),
    countQuery,
  ]);

  const total = countResult[0].total;

  return {
    data,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}


// Function to get ticket statistics
export async function getTicketStats() {
  /*equivalent of:
  SELECT status, COUNT(*) AS total
  FROM tickets
  GROUP BY status;
*/

  const rows = await db
    .select({
      status: tickets.status,
      total: count(),
    })
    .from(tickets)
    .groupBy(tickets.status);

  const stats = {
    open: 0,
    in_progress: 0,
    closed: 0,
  };

  for (const row of rows) {
    stats[row.status] = row.total;
  }

  return stats;
}


// Function to update a ticket by ID
export async function updateTicket(
  id: number,
  input: UpdateTicketInput
) {
  const [updatedTicket] = await db
    .update(tickets)
    .set(input)
    .where(eq(tickets.id, id))
    .returning();

  return updatedTicket ?? null;
}
