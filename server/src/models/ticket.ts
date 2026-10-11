import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { tickets } from "../db/schema.js";

export type Ticket = InferSelectModel<typeof tickets>;

export type NewTicket = InferInsertModel<typeof tickets>;
