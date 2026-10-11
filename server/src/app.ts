import express, { type Express } from "express";
import cors from "cors";
import "dotenv/config";

import ticketsRouter from "./routes/ticketRoute.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app: Express = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
}));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/tickets", ticketsRouter);

// Return JSON for unknown endpoints.
app.use((_req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested endpoint was not found.",
  });
});

// Error-handling middleware must be registered last.
app.use(errorHandler);

export default app;