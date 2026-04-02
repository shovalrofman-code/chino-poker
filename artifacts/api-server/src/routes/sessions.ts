import { Router, type IRouter } from "express";
import { db, sessionsTable, sessionPlayersTable, buyinsTable, playersTable, groupBalanceTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

const CHIPS_RATIO = 2;

function formatSession(s: typeof sessionsTable.$inferSelect) {
  return {
    id: s.id,
    status: s.status,
    startedAt: s.startedAt?.toISOString(),
    closedAt: s.closedAt?.toISOString() ?? null,
    totalRake: parseFloat(s.totalRake as string || "0"),
  };
}

async function getSessionWithPlayers(sessionId: number) {
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, sessionId));
  if (!session) return null;

  const sessionPlayers = await db
    .select()
    .from(sessionPlayersTable)
    .where(eq(sessionPlayersTable.sessionId, sessionId));

  const playerIds = sessionPlayers.map(sp => sp.playerId);
  const players = playerIds.length > 0
    ? await db.select().from(playersTable).where(sql`${playersTable.id} = ANY(ARRAY[${sql.join(playerIds.map(id => sql`${id}`), sql`, `)}]::int[])`)
    : [];

  const buyins = sessionPlayers.length > 0
    ? await db.select().from(buyinsTable).where(eq(buyinsTable.sessionId, sessionId)).orderBy(desc(buyinsTable.createdAt))
    : [];

  const playersMap = new Map(players.map(p => [p.id, p]));

  const playersDetail = sessionPlayers.map(sp => {
    const player = playersMap.get(sp.playerId);
    const playerBuyins = buyins.filter(b => b.playerId === sp.playerId);
    return {
      id: sp.id,
      sessionId: sp.sessionId,
      playerId: sp.playerId,
      totalBuyins: parseFloat(sp.totalBuyins as string || "0"),
      finalChips: sp.finalChips !== null ? parseFloat(sp.finalChips as string) : null,
      player: player ? {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        phone: player.phone,
        isGuest: player.isGuest,
        createdAt: player.createdAt?.toISOString(),
      } : null,
      buyins: playerBuyins.map(b => ({
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
    id: session.id,
    status: session.status,
    startedAt: session.startedAt?.toISOString(),
    closedAt: session.closedAt?.toISOString() ?? null,
    totalRake: parseFloat(session.totalRake as string || "0"),
    players: playersDetail,
  };
}

router.get("/sessions", async (req, res) => {
  const sessions = await db.select().from(sessionsTable).orderBy(desc(sessionsTable.startedAt));
  res.json(sessions.map(formatSession));
});

router.post("/sessions", async (req, res) => {
  const [existing] = await db.select().from(sessionsTable).where(eq(sessionsTable.status, "active"));
  if (existing) {
    res.status(400).json({ error: "An active session already exists" });
    return;
  }
  const { note } = req.body;
  const [session] = await db.insert(sessionsTable).values({ note: note || null, status: "active", totalRake: "0" }).returning();
  res.status(201).json(formatSession(session));
});

router.get("/sessions/active", async (req, res) => {
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.status, "active"));
  if (!session) {
    res.status(404).json({ error: "No active session" });
    return;
  }
  const result = await getSessionWithPlayers(session.id);
  if (!result) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(result);
});

router.get("/sessions/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await getSessionWithPlayers(id);
  if (!result) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(result);
});

router.post("/sessions/:id/players", async (req, res) => {
  const sessionId = parseInt(req.params.id);
  const { playerId, initialBuyin } = req.body;

  const [session] = await db.select().from(sessionsTable).where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.status, "active")));
  if (!session) {
    res.status(404).json({ error: "Active session not found" });
    return;
  }

  const [existing] = await db.select().from(sessionPlayersTable).where(
    and(eq(sessionPlayersTable.sessionId, sessionId), eq(sessionPlayersTable.playerId, playerId))
  );
  if (existing) {
    res.status(400).json({ error: "Player already in session" });
    return;
  }

  const chips = (initialBuyin || 50) * CHIPS_RATIO;
  const [sp] = await db.insert(sessionPlayersTable).values({
    sessionId,
    playerId,
    totalBuyins: String(initialBuyin || 50),
    finalChips: null,
  }).returning();

  await db.insert(buyinsTable).values({
    sessionId,
    playerId,
    amount: String(initialBuyin || 50),
    chips: String(chips),
  });

  res.status(201).json({
    id: sp.id,
    sessionId: sp.sessionId,
    playerId: sp.playerId,
    totalBuyins: parseFloat(sp.totalBuyins as string || "0"),
    finalChips: sp.finalChips !== null ? parseFloat(sp.finalChips as string) : null,
  });
});

router.post("/sessions/:id/buyins", async (req, res) => {
  const sessionId = parseInt(req.params.id);
  const { playerId, amount } = req.body;

  const [session] = await db.select().from(sessionsTable).where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.status, "active")));
  if (!session) {
    res.status(404).json({ error: "Active session not found" });
    return;
  }

  const chips = amount * CHIPS_RATIO;

  const [buyin] = await db.insert(buyinsTable).values({
    sessionId,
    playerId,
    amount: String(amount),
    chips: String(chips),
  }).returning();

  const [sp] = await db.select().from(sessionPlayersTable).where(
    and(eq(sessionPlayersTable.sessionId, sessionId), eq(sessionPlayersTable.playerId, playerId))
  );
  if (sp) {
    const currentTotal = parseFloat(sp.totalBuyins as string || "0");
    await db.update(sessionPlayersTable)
      .set({ totalBuyins: String(currentTotal + amount) })
      .where(eq(sessionPlayersTable.id, sp.id));
  }

  res.status(201).json({
    id: buyin.id,
    sessionId: buyin.sessionId,
    playerId: buyin.playerId,
    amount: parseFloat(buyin.amount as string),
    chips: parseFloat(buyin.chips as string),
    createdAt: buyin.createdAt?.toISOString(),
  });
});

// DELETE a specific buy-in (undo action)
router.delete("/sessions/:id/buyins/:buyinId", async (req, res) => {
  const sessionId = parseInt(req.params.id);
  const buyinId = parseInt(req.params.buyinId);

  const [session] = await db.select().from(sessionsTable).where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.status, "active")));
  if (!session) {
    res.status(404).json({ error: "Active session not found" });
    return;
  }

  const [buyin] = await db.select().from(buyinsTable).where(and(eq(buyinsTable.id, buyinId), eq(buyinsTable.sessionId, sessionId)));
  if (!buyin) {
    res.status(404).json({ error: "Buy-in not found" });
    return;
  }

  const amount = parseFloat(buyin.amount as string);

  await db.delete(buyinsTable).where(eq(buyinsTable.id, buyinId));

  const [sp] = await db.select().from(sessionPlayersTable).where(
    and(eq(sessionPlayersTable.sessionId, sessionId), eq(sessionPlayersTable.playerId, buyin.playerId))
  );
  if (sp) {
    const currentTotal = parseFloat(sp.totalBuyins as string || "0");
    const newTotal = Math.max(0, currentTotal - amount);
    await db.update(sessionPlayersTable)
      .set({ totalBuyins: String(newTotal) })
      .where(eq(sessionPlayersTable.id, sp.id));
  }

  res.json({ success: true, deletedAmount: amount });
});

router.post("/sessions/:id/close", async (req, res) => {
  const sessionId = parseInt(req.params.id);
  const { finalChips } = req.body as { finalChips: Array<{ playerId: number; chips: number }> };

  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, sessionId));
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const sessionPlayers = await db.select().from(sessionPlayersTable).where(eq(sessionPlayersTable.sessionId, sessionId));
  const playerIds = sessionPlayers.map(sp => sp.playerId);
  const players = playerIds.length > 0
    ? await db.select().from(playersTable).where(sql`${playersTable.id} = ANY(ARRAY[${sql.join(playerIds.map(id => sql`${id}`), sql`, `)}]::int[])`)
    : [];
  const playersMap = new Map(players.map(p => [p.id, p]));

  for (const fc of finalChips) {
    const sp = sessionPlayers.find(sp => sp.playerId === fc.playerId);
    if (sp) {
      await db.update(sessionPlayersTable)
        .set({ finalChips: String(fc.chips) })
        .where(eq(sessionPlayersTable.id, sp.id));
    }
  }

  const playerSettlements = sessionPlayers.map(sp => {
    const player = playersMap.get(sp.playerId);
    const fcEntry = finalChips.find(fc => fc.playerId === sp.playerId);
    const totalBuyinsAmount = parseFloat(sp.totalBuyins as string || "0");
    const totalBuyinsChips = totalBuyinsAmount * CHIPS_RATIO;
    const finalChipsValue = fcEntry ? fcEntry.chips : 0;

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

  const totalRake = playerSettlements.reduce((sum, ps) => sum + ps.rake, 0);
  const totalPot = playerSettlements.reduce((sum, ps) => sum + ps.totalBuyins, 0);

  const balances = playerSettlements.map(ps => ({
    playerId: ps.playerId,
    name: `${ps.firstName} ${ps.lastName}`,
    phone: ps.phone,
    balance: ps.netProfit,
  }));

  const transfers: Array<{
    fromPlayerId: number; fromName: string; fromPhone: string;
    toPlayerId: number; toName: string; toPhone: string;
    amount: number;
  }> = [];

  const debtors = balances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
  const creditors = balances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);

  let di = 0, ci = 0;
  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di];
    const creditor = creditors[ci];
    const amount = Math.min(-debtor.balance, creditor.balance);
    if (amount > 0.01) {
      transfers.push({
        fromPlayerId: debtor.playerId, fromName: debtor.name, fromPhone: debtor.phone,
        toPlayerId: creditor.playerId, toName: creditor.name, toPhone: creditor.phone,
        amount: Math.round(amount * 100) / 100,
      });
    }
    debtor.balance += amount;
    creditor.balance -= amount;
    if (Math.abs(debtor.balance) < 0.01) di++;
    if (Math.abs(creditor.balance) < 0.01) ci++;
  }

  await db.update(sessionsTable)
    .set({ status: "closed", closedAt: new Date(), totalRake: String(totalRake) })
    .where(eq(sessionsTable.id, sessionId));

  await db.insert(groupBalanceTable).values({ sessionId, rake: String(totalRake) });

  res.json({ sessionId, totalPot, totalRake, players: playerSettlements, transfers });
});

router.get("/sessions/:id/settlement", async (req, res) => {
  const sessionId = parseInt(req.params.id);

  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, sessionId));
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const sessionPlayers = await db.select().from(sessionPlayersTable).where(eq(sessionPlayersTable.sessionId, sessionId));
  const playerIds = sessionPlayers.map(sp => sp.playerId);
  const players = playerIds.length > 0
    ? await db.select().from(playersTable).where(sql`${playersTable.id} = ANY(ARRAY[${sql.join(playerIds.map(id => sql`${id}`), sql`, `)}]::int[])`)
    : [];
  const playersMap = new Map(players.map(p => [p.id, p]));

  const playerSettlements = sessionPlayers.map(sp => {
    const player = playersMap.get(sp.playerId);
    const totalBuyinsAmount = parseFloat(sp.totalBuyins as string || "0");
    const totalBuyinsChips = totalBuyinsAmount * CHIPS_RATIO;
    const finalChipsValue = sp.finalChips !== null ? parseFloat(sp.finalChips as string) : 0;

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

  const totalRake = parseFloat(session.totalRake as string || "0");
  const totalPot = playerSettlements.reduce((sum, ps) => sum + ps.totalBuyins, 0);

  const balances = playerSettlements.map(ps => ({
    playerId: ps.playerId,
    name: `${ps.firstName} ${ps.lastName}`,
    phone: ps.phone,
    balance: ps.netProfit,
  }));

  const transfers: Array<{
    fromPlayerId: number; fromName: string; fromPhone: string;
    toPlayerId: number; toName: string; toPhone: string;
    amount: number;
  }> = [];

  const debtors = balances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
  const creditors = balances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);

  let di = 0, ci = 0;
  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di];
    const creditor = creditors[ci];
    const amount = Math.min(-debtor.balance, creditor.balance);
    if (amount > 0.01) {
      transfers.push({
        fromPlayerId: debtor.playerId, fromName: debtor.name, fromPhone: debtor.phone,
        toPlayerId: creditor.playerId, toName: creditor.name, toPhone: creditor.phone,
        amount: Math.round(amount * 100) / 100,
      });
    }
    debtor.balance += amount;
    creditor.balance -= amount;
    if (Math.abs(debtor.balance) < 0.01) di++;
    if (Math.abs(creditor.balance) < 0.01) ci++;
  }

  res.json({ sessionId, totalPot, totalRake, players: playerSettlements, transfers });
});

router.get("/group-balance", async (req, res) => {
  const result = await db
    .select({ totalRake: sql<number>`COALESCE(SUM(${groupBalanceTable.rake}::numeric), 0)`, sessionsCount: sql<number>`COUNT(*)` })
    .from(groupBalanceTable);

  res.json({
    totalRake: parseFloat(String(result[0]?.totalRake || 0)),
    sessionsCount: parseInt(String(result[0]?.sessionsCount || 0)),
  });
});

export default router;
