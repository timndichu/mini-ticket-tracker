
import { Router } from "express";
import { createTicketController } from "../controllers/ticketController.js";
import { validateBody } from "../middleware/validate.js";
import { createTicketSchema } from "../schemas/ticketSchema.js";

const router = Router();

router.post(
  "/",
  validateBody(createTicketSchema),
  createTicketController,
);

export default router;