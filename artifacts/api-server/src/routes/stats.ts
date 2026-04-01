import { Router, type IRouter } from "express";
import { db, playersTable, sessionsTable, sessionPlayersTable, buyinsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

const CHIPS_RATIO = 2;

async function buildPlayerStats(playerId: number) {
  const [player] = await db.select().from(playersTable).where(eq(playersTable.id, playerId));
  if (!player) return null;

  const sessions = await db
    .select()
    .from(sessionPlayersTable)
    .where(eq(sessionPlayersTable.playerId, playerId));

  const closedSessions = sessions.filter(sp => sp.finalChips !== null);

  let totalProfit = 0;
  let wins = 0;
  let biggestWin = 0;
  let biggestLoss = 0;
  let totalBuyinsSum = 0;

  for (const sp of closedSessions) {
    const totalBuyins = parseFloat(sp.totalBuyins as string || "0");
    const finalChips = parseFloat(sp.finalChips as string || "0");
    const totalBuyinsChips = totalBuyins * CHIPS_RATIO;
    const profitChips = finalChips - totalBuyinsChips;
    const profitNIS = profitChips / CHIPS_RATIO;
    const rake = profitNIS > 0 ? profitNIS * 0.1 : 0;
    const netProfit = profitNIS - rake;

    totalProfit += netProfit;
    totalBuyinsSum += totalBuyins;
    if (netProfit > 0) wins++;
    if (netProfit > biggestWin) biggestWin = netProfit;
    if (netProfit < biggestLoss) biggestLoss = netProfit;
  }

  const totalGames = closedSessions.length;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

  return {
    playerId: player.id,
    firstName: player.firstName,
    lastName: player.lastName,
    phone: player.phone,
    totalGames,
    totalBuyins: totalBuyinsSum,
    totalProfit,
    winRate,
    biggestWin,
    biggestLoss,
  };
}

router.get("/players/:id/stats", async (req, res) => {
  const id = parseInt(req.params.id);
  const stats = await buildPlayerStats(id);
  if (!stats) {
    res.status(404).json({ error: "Player not found" });
    return;
  }
  res.json(stats);
});

router.get("/stats/leaderboard", async (req, res) => {
  const players = await db.select().from(playersTable).where(eq(playersTable.isGuest, false));
  const statsPromises = players.map(p => buildPlayerStats(p.id));
  const allStats = await Promise.all(statsPromises);
  const validStats = allStats.filter(s => s !== null && s.totalGames > 0);
  validStats.sort((a, b) => (b!.totalProfit) - (a!.totalProfit));
  res.json(validStats);
});

export default router;
