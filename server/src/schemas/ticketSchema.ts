
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

export type CreateTicketInput = z.infer<
  typeof createTicketSchema
>;