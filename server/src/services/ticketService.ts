
import { db } from "../db/index.js";
import { tickets } from "../db/schema.js";
import type { CreateTicketInput } from "../schemas/ticketSchema.js";

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