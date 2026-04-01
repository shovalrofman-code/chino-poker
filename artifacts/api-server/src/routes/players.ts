import { Router, type IRouter } from "express";
import { db, playersTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";

const router: IRouter = Router();

router.get("/players", async (req, res) => {
  const players = await db.select().from(playersTable).orderBy(playersTable.firstName);
  res.json(players.map(p => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    phone: p.phone,
    isGuest: p.isGuest,
    createdAt: p.createdAt?.toISOString(),
  })));
});

router.get("/players/search", async (req, res) => {
  const q = String(req.query.q || "");
  if (!q.trim()) {
    res.json([]);
    return;
  }
  const players = await db
    .select()
    .from(playersTable)
    .where(
      or(
        ilike(playersTable.firstName, `%${q}%`),
        ilike(playersTable.lastName, `%${q}%`),
        ilike(playersTable.phone, `%${q}%`)
      )
    )
    .limit(10);
  res.json(players.map(p => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    phone: p.phone,
    isGuest: p.isGuest,
    createdAt: p.createdAt?.toISOString(),
  })));
});

router.get("/players/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [player] = await db.select().from(playersTable).where(eq(playersTable.id, id));
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }
  res.json({
    id: player.id,
    firstName: player.firstName,
    lastName: player.lastName,
    phone: player.phone,
    isGuest: player.isGuest,
    createdAt: player.createdAt?.toISOString(),
  });
});

router.post("/players", async (req, res) => {
  const { firstName, lastName, phone, isGuest } = req.body;
  const [player] = await db
    .insert(playersTable)
    .values({ firstName, lastName, phone: phone || "", isGuest: isGuest || false })
    .returning();
  res.status(201).json({
    id: player.id,
    firstName: player.firstName,
    lastName: player.lastName,
    phone: player.phone,
    isGuest: player.isGuest,
    createdAt: player.createdAt?.toISOString(),
  });
});

export default router;
