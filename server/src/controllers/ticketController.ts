import type { RequestHandler } from "express";
import type { CreateTicketInput } from "../schemas/ticketSchema.js";
import { createTicket, getTicketStats, updateTicket } from "../services/ticketService.js";
import { listTicketsQuerySchema, updateTicketSchema } from "../schemas/ticketSchema.js";
import { listTickets } from "../services/ticketService.js";

// Controller to create a new ticket
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

// Controller to list tickets with pagination and filtering
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


// Controller to get ticket statistics
export const getTicketStatsController: RequestHandler = async (
  _req,
  res,
  next
) => {
  try {
    const stats = await getTicketStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};


// Controller to update a ticket by ID
export const updateTicketController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid ticket ID" });
      return;
    }

    const validation = updateTicketSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: "Validation failed",
        details: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const ticket = await updateTicket(id, validation.data);

    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
};
