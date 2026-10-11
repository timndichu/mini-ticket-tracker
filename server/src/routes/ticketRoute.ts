
import { Router } from "express";
import { createTicketController, getTicketStatsController, listTicketsController } from "../controllers/ticketController.js";
import { validateBody } from "../middleware/validate.js";
import { createTicketSchema } from "../schemas/ticketSchema.js";


const router = Router();

router.post(
  "/",
  validateBody(createTicketSchema),
  createTicketController,
);

router.get("/", listTicketsController);

router.get("/stats", getTicketStatsController);

export default router;