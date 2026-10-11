import {
  pgTable,
  pgEnum,
  integer,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "closed",
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "low",
  "medium",
  "high",
]);

// Define the tickets table
export const tickets = pgTable(
  "tickets",
  {
    //define a PostgreSQL auto-incrementing id column as the primary key for the tickets table
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    title: varchar("title", { length: 200 }).notNull(),

    description: text("description"),

    status: ticketStatusEnum("status")
      .notNull()
      .default("open"),

    priority: ticketPriorityEnum("priority")
      .notNull()
      .default("medium"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
 
(table) => [
  // Supports sorting tickets by creation time and ID,
  // including paginated queries without a status filter.
  index("idx_tickets_created_at").on(
    table.createdAt,
    table.id,
  ),

  // Supports filtering tickets by status and then
  // sorting the results by creation time and ID.
  index("idx_tickets_status_created_at").on(
    table.status,
    table.createdAt,
    table.id,
  ),
],

);
