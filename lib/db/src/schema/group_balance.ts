import { pgTable, serial, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sessionsTable } from "./sessions";

export const groupBalanceTable = pgTable("group_balance", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => sessionsTable.id),
  rake: numeric("rake", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGroupBalanceSchema = createInsertSchema(groupBalanceTable).omit({ id: true, createdAt: true });
export type InsertGroupBalance = z.infer<typeof insertGroupBalanceSchema>;
export type GroupBalance = typeof groupBalanceTable.$inferSelect;
