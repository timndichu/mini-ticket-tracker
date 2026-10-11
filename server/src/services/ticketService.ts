
import { db } from "../db/index.js";
import { tickets } from "../db/schema.js";
import type { CreateTicketInput } from "../schemas/ticketSchema.js";
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
