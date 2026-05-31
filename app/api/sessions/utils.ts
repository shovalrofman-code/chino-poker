import { supabase } from "@/lib/supabase";

export const CHIPS_RATIO = 2; // 1 NIS = 2 Chips

/**
 * Utility: Formats a session row for API consumption.
 */
export function formatSession(s: any) {
  return {
    id: s.id,
    status: s.status,
    startedAt: s.started_at,
    closedAt: s.closed_at ?? null,
    totalRake: parseFloat(String(s.total_rake || "0")),
  };
}

/**
 * Service: Fetches a session with all its associated players, buy-ins, and metadata.
 */
export async function getSessionWithPlayers(sessionId: number) {
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) return null;

  const { data: sessionPlayers, error: spError } = await supabase
    .from('session_players')
    .select('*')
    .eq('session_id', sessionId);

  if (spError) return null;

  const playerIds = sessionPlayers.map((sp: any) => sp.player_id);
  
  let players: any[] = [];
  if (playerIds.length > 0) {
    const { data: playersData, error: pError } = await supabase
      .from('players')
      .select('*')
      .in('id', playerIds);
    if (!pError) players = playersData || [];
  }

  const { data: buyins, error: bError } = await supabase
    .from('buyins')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  const buyinsData = bError ? [] : buyins || [];

  const playersMap = new Map(players.map((p) => [p.id, p]));

  const playersDetail = sessionPlayers.map((sp: any) => {
    const player = playersMap.get(sp.player_id);
    const playerBuyins = buyinsData.filter((b: any) => b.player_id === sp.player_id);
    
    return {
      id: sp.id,
      sessionId: sp.session_id,
      playerId: sp.player_id,
      totalBuyins: parseFloat(String(sp.total_buyins || "0")),
      finalChips: sp.final_chips !== null ? parseFloat(String(sp.final_chips)) : null,
      player: player
        ? {
            id: player.id,
            firstName: player.first_name,
            lastName: player.last_name,
            phone: player.phone,
            isGuest: player.is_guest,
            createdAt: player.created_at,
          }
        : null,
      buyins: playerBuyins.map((b: any) => ({
        id: b.id,
        sessionId: b.session_id,
        playerId: b.player_id,
        amount: parseFloat(String(b.amount || "0")),
        chips: parseFloat(String(b.chips || "0")),
        createdAt: b.created_at,
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
  session: any,
  sessionPlayers: any[],
  players: any[],
  finalChipsOverride?: Array<{ playerId: number; chips: number }>
) {
  const playersMap = new Map(players.map((p) => [p.id, p]));

  const playerSettlements = sessionPlayers.map((sp) => {
    const playerId = sp.player_id || sp.playerId;
    const player = playersMap.get(playerId);
    const fcEntry = finalChipsOverride?.find((fc) => fc.playerId === playerId);
    
    const totalBuyinsAmount = parseFloat(String(sp.total_buyins || sp.totalBuyins || "0")) || 0;
    const totalBuyinsChips = totalBuyinsAmount * CHIPS_RATIO;

    let finalChipsValue = 0;
    if (finalChipsOverride) {
      finalChipsValue = fcEntry?.chips ?? 0;
    } else {
      const val = sp.final_chips ?? sp.finalChips;
      finalChipsValue = val !== null && val !== undefined ? parseFloat(String(val)) : 0;
    }
    
    if (isNaN(finalChipsValue)) finalChipsValue = 0;

    const profitChips = finalChipsValue - totalBuyinsChips;
    const profitNIS = profitChips / CHIPS_RATIO;
    const rake = profitNIS > 0 ? profitNIS * 0.1 : 0;
    const netProfit = profitNIS - rake;

    return {
      playerId,
      firstName: player?.first_name || player?.firstName || "Unknown",
      lastName: player?.last_name || player?.lastName || "",
      phone: player?.phone || "",
      totalBuyins: totalBuyinsAmount,
      finalChips: finalChipsValue,
      profit: Math.round(profitNIS * 100) / 100,
      rake: Math.round(rake * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
    };
  });

  const totalRake = finalChipsOverride
    ? playerSettlements.reduce((sum, ps) => sum + ps.rake, 0)
    : parseFloat(String(session.total_rake || session.totalRake || "0")) || 0;

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
  const debtors = balances.filter((b) => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
  const creditors = balances.filter((b) => b.balance > 0.01).sort((a, b) => b.balance - a.balance);

  let dIdx = 0;
  let cIdx = 0;

  // Clone balances to avoid mutating the original objects if they are reused
  const workingDebtors = debtors.map(d => ({ ...d }));
  const workingCreditors = creditors.map(c => ({ ...c }));

  while (dIdx < workingDebtors.length && cIdx < workingCreditors.length) {
    const debtor = workingDebtors[dIdx];
    const creditor = workingCreditors[cIdx];
    
    // Amount to transfer is the minimum of what's owed and what's to be received
    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);

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
    totalRake: Math.round(totalRake * 100) / 100,
    players: playerSettlements,
    transfers,
  };
}
