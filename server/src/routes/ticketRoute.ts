
import { Router } from "express";
import { createTicketController, listTicketsController } from "../controllers/ticketController.js";
import { validateBody } from "../middleware/validate.js";
import { createTicketSchema } from "../schemas/ticketSchema.js";


const router = Router();

router.post(
  "/",
  validateBody(createTicketSchema),
  createTicketController,
);

router.get("/", listTicketsController);

export default router;