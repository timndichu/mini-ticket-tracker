import express, { type Express } from "express";
import cors from "cors";
import "dotenv/config";

import ticketsRouter from "./routes/ticketRoute.js";

const app: Express = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
}));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/tickets", ticketsRouter);

export default app;