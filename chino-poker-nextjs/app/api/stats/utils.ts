import { supabase } from "@/lib/supabase";

const CHIPS_RATIO = 2;

/**
 * Service: Builds comprehensive performance statistics for a single player.
 */
export async function buildPlayerStats(playerId: number) {
  const { data: player, error: pError } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single();

  if (pError || !player) return null;

  const { data: playerSessions, error: psError } = await supabase
    .from('session_players')
    .select('*')
    .eq('player_id', playerId);

  if (psError || !playerSessions) return null;

  const closedSessions = playerSessions.filter((s: any) => s.final_chips !== null);
  const totalGames = closedSessions.length;

  let totalBuyinsSum = 0;
  let totalProfit = 0;
  let wins = 0;
  let losses = 0;
  let biggestWin = 0;
  let biggestLoss = 0;

  const sessionResults: number[] = [];

  closedSessions.forEach((s: any) => {
    const buyins = parseFloat(s.total_buyins || "0");
    const finalChips = parseFloat(s.final_chips || "0");
    const profitNIS = (finalChips - buyins * CHIPS_RATIO) / CHIPS_RATIO;
    const rake = profitNIS > 0 ? profitNIS * 0.1 : 0;
    const netProfit = profitNIS - rake;

    totalBuyinsSum += buyins;
    totalProfit += netProfit;
    sessionResults.push(netProfit);

    if (netProfit > 0) {
      wins++;
      if (netProfit > biggestWin) biggestWin = netProfit;
    } else if (netProfit < 0) {
      losses++;
      if (netProfit < biggestLoss) biggestLoss = netProfit;
    }
  });

  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
  const avgProfit = totalGames > 0 ? totalProfit / totalGames : 0;
  const avgBuyin = totalGames > 0 ? totalBuyinsSum / totalGames : 0;
  const roi = totalBuyinsSum > 0 ? (totalProfit / totalBuyinsSum) * 100 : 0;

  // Streak Calculations
  let currentWinStreak = 0;
  let longestWinStreak = 0;
  let currentLossStreak = 0;
  let longestLossStreak = 0;

  sessionResults.forEach((res) => {
    if (res > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      if (currentWinStreak > longestWinStreak) longestWinStreak = currentWinStreak;
    } else if (res < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      if (currentLossStreak > longestLossStreak) longestLossStreak = currentLossStreak;
    } else {
      currentWinStreak = 0;
      currentLossStreak = 0;
    }
  });

  return {
    playerId: player.id,
    firstName: player.first_name,
    lastName: player.last_name,
    phone: player.phone,
    totalGames,
    totalBuyins: totalBuyinsSum,
    totalProfit,
    winRate,
    biggestWin,
    biggestLoss,
    wins,
    losses,
    avgProfit,
    avgBuyin,
    roi,
    longestWinStreak,
    longestLossStreak,
  };
}
