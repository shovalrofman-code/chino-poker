import { pgTable, serial, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sessionsTable } from "./sessions";
import { playersTable } from "./players";

export const sessionPlayersTable = pgTable("session_players", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => sessionsTable.id),
  playerId: integer("player_id").notNull().references(() => playersTable.id),
  totalBuyins: numeric("total_buyins", { precision: 10, scale: 2 }).notNull().default("0"),
  finalChips: numeric("final_chips", { precision: 10, scale: 2 }),
});

export const insertSessionPlayerSchema = createInsertSchema(sessionPlayersTable).omit({ id: true });
export type InsertSessionPlayer = z.infer<typeof insertSessionPlayerSchema>;
export type SessionPlayer = typeof sessionPlayersTable.$inferSelect;
