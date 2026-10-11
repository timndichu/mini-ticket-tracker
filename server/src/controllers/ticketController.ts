
import type { RequestHandler } from "express";
import type { CreateTicketInput } from "../schemas/ticketSchema.js";
import { createTicket } from "../services/ticketService.js";

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
