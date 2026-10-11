import {
  pgTable,
  pgEnum,
  serial,
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

export const tickets = pgTable(
  "tickets",
  {
    id: serial("id").primaryKey(),

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
    index("idx_tickets_created_at").on(
      table.createdAt,
      table.id,
    ),
    index("idx_tickets_status_created_at").on(
      table.status,
      table.createdAt,
      table.id,
    ),
  ],
);
