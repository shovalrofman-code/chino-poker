import {
  db,
  sessionsTable,
  sessionPlayersTable,
  buyinsTable,
  playersTable,
} from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

export const CHIPS_RATIO = 2; // 1 NIS = 2 Chips

/**
 * Utility: Formats a session row for API consumption.
 */
export function formatSession(s: typeof sessionsTable.$inferSelect) {
  return {
    id: s.id,
    status: s.status,
    startedAt: s.startedAt?.toISOString(),
    closedAt: s.closedAt?.toISOString() ?? null,
    totalRake: parseFloat(s.totalRake as string || "0"),
  };
}

/**
 * Service: Fetches a session with all its associated players, buy-ins, and metadata.
 */
export async function getSessionWithPlayers(sessionId: number) {
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));

  if (!session) return null;

  const sessionPlayers = await db
    .select()
    .from(sessionPlayersTable)
    .where(eq(sessionPlayersTable.sessionId, sessionId));

  const playerIds = sessionPlayers.map((sp) => sp.playerId);
  
  const players =
    playerIds.length > 0
      ? await db
          .select()
          .from(playersTable)
          .where(
            sql`${playersTable.id} = ANY(ARRAY[${sql.join(
              playerIds.map((id) => sql`${id}`),
              sql`, `
            )}]::int[])`
          )
      : [];

  const buyins =
    sessionPlayers.length > 0
      ? await db
          .select()
          .from(buyinsTable)
          .where(eq(buyinsTable.sessionId, sessionId))
          .orderBy(desc(buyinsTable.createdAt))
      : [];

  const playersMap = new Map(players.map((p) => [p.id, p]));

  const playersDetail = sessionPlayers.map((sp) => {
    const player = playersMap.get(sp.playerId);
    const playerBuyins = buyins.filter((b) => b.playerId === sp.playerId);
    
    return {
      id: sp.id,
      sessionId: sp.sessionId,
      playerId: sp.playerId,
      totalBuyins: parseFloat(sp.totalBuyins as string || "0"),
      finalChips: sp.finalChips !== null ? parseFloat(sp.finalChips as string) : null,
      player: player
        ? {
            id: player.id,
            firstName: player.firstName,
            lastName: player.lastName,
            phone: player.phone,
            isGuest: player.isGuest,
            createdAt: player.createdAt?.toISOString(),
          }
        : null,
      buyins: playerBuyins.map((b) => ({
        id: b.id,
        sessionId: b.sessionId,
        playerId: b.playerId,
        amount: parseFloat(b.amount as string),
        chips: parseFloat(b.chips as string),
        createdAt: b.createdAt?.toISOString(),
      })),
    };
  });

  return {
    ...formatSession(session),
    players: playersDetail,
  };
}

/**
 * Logic: Calculates financial settlement (rake, profit, transfers) for a session.
 */
export function calculateSettlement(
  session: typeof sessionsTable.$inferSelect,
  sessionPlayers: (typeof sessionPlayersTable.$inferSelect)[],
  players: (typeof playersTable.$inferSelect)[],
  finalChipsOverride?: Array<{ playerId: number; chips: number }>
) {
  const playersMap = new Map(players.map((p) => [p.id, p]));

  const playerSettlements = sessionPlayers.map((sp) => {
    const player = playersMap.get(sp.playerId);
    const fcEntry = finalChipsOverride?.find((fc) => fc.playerId === sp.playerId);
    const totalBuyinsAmount = parseFloat(sp.totalBuyins as string || "0");
    const totalBuyinsChips = totalBuyinsAmount * CHIPS_RATIO;

    const finalChipsValue = finalChipsOverride
      ? fcEntry?.chips ?? 0
      : sp.finalChips !== null
      ? parseFloat(sp.finalChips as string)
      : 0;

    const profitChips = finalChipsValue - totalBuyinsChips;
    const profitNIS = profitChips / CHIPS_RATIO;
    const rake = profitNIS > 0 ? profitNIS * 0.1 : 0;
    const netProfit = profitNIS - rake;

    return {
      playerId: sp.playerId,
      firstName: player?.firstName || "",
      lastName: player?.lastName || "",
      phone: player?.phone || "",
      totalBuyins: totalBuyinsAmount,
      finalChips: finalChipsValue,
      profit: profitNIS,
      rake,
      netProfit,
    };
  });

  const totalRake = finalChipsOverride
    ? playerSettlements.reduce((sum, ps) => sum + ps.rake, 0)
    : parseFloat(session.totalRake as string || "0");

  const totalPot = playerSettlements.reduce((sum, ps) => sum + ps.totalBuyins, 0);

  // Transfer Calculation Logic (Debtors to Creditors)
  const balances = playerSettlements
    .map((ps) => ({
      playerId: ps.playerId,
      name: `${ps.firstName} ${ps.lastName}`,
      phone: ps.phone,
      balance: ps.netProfit,
    }))
    .filter((b) => Math.abs(b.balance) > 0.01);

  const transfers: any[] = [];
  const debtors = balances.filter((b) => b.balance < 0).sort((a, b) => a.balance - b.balance);
  const creditors = balances.filter((b) => b.balance > 0).sort((a, b) => b.balance - a.balance);

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const amount = Math.min(-debtor.balance, creditor.balance);

    if (amount > 0.01) {
      transfers.push({
        fromPlayerId: debtor.playerId,
        fromName: debtor.name,
        fromPhone: debtor.phone,
        toPlayerId: creditor.playerId,
        toName: creditor.name,
        toPhone: creditor.phone,
        amount: Math.round(amount * 100) / 100,
      });
    }

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) dIdx++;
    if (Math.abs(creditor.balance) < 0.01) cIdx++;
  }

  return {
    sessionId: session.id,
    totalPot,
    totalRake,
    players: playerSettlements,
    transfers,
  };
}
