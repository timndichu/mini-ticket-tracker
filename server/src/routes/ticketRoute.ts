
import { Router } from "express";
import { createTicketController, getTicketStatsController, listTicketsController, updateTicketController } from "../controllers/ticketController.js";
import { validateBody } from "../middleware/validate.js";
import { createTicketSchema } from "../schemas/ticketSchema.js";

// Define the routes for ticket-related operations
const router = Router();

// Route to create a new ticket
router.post(
  "/",
  validateBody(createTicketSchema),
  createTicketController,
);

// Route to list tickets with pagination and filtering
router.get("/", listTicketsController);

// Route to get ticket statistics
router.get("/stats", getTicketStatsController);

// Route to update a ticket by ID
router.patch("/:id", updateTicketController);

export default router;