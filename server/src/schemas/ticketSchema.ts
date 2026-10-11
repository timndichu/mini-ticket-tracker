
import { z } from "zod";

export const createTicketSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title must not exceed 200 characters"),
    description: z.string().optional(),
    status: z
      .enum(["open", "in_progress", "closed"])
      .optional(),
    priority: z
      .enum(["low", "medium", "high"])
      .optional(),
  })
  .strict();


export const listTicketsQuerySchema = z.object({
  status: z.enum(["open", "in_progress", "closed"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type ListTicketsQuery = z.infer<
  typeof listTicketsQuerySchema
>;


export type CreateTicketInput = z.infer<
  typeof createTicketSchema
>;