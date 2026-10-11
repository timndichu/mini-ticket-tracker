import type { RequestHandler } from "express";
import type { CreateTicketInput } from "../schemas/ticketSchema.js";
import { createTicket } from "../services/ticketService.js";
import { listTicketsQuerySchema } from "../schemas/ticketSchema.js";
import { listTickets } from "../services/ticketService.js";

export const createTicketController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const input = req.body as CreateTicketInput;

    const ticket = await createTicket(input);

    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
};

export const listTicketsController: RequestHandler = async (req, res, next) => {
  try {
    const result = listTicketsQuerySchema.safeParse(req.query);

    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const ticketsResult = await listTickets(result.data);

    res.status(200).json(ticketsResult);
  } catch (error) {
    next(error);
  }
};
