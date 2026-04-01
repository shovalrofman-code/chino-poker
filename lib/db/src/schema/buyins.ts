import { pgTable, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sessionsTable } from "./sessions";
import { playersTable } from "./players";

export const buyinsTable = pgTable("buyins", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => sessionsTable.id),
  playerId: integer("player_id").notNull().references(() => playersTable.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  chips: numeric("chips", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBuyinSchema = createInsertSchema(buyinsTable).omit({ id: true, createdAt: true });
export type InsertBuyin = z.infer<typeof insertBuyinSchema>;
export type Buyin = typeof buyinsTable.$inferSelect;
