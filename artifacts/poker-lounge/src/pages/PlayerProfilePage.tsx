import { useParams, Link } from "wouter";
import { useGetPlayer, useGetPlayerStats, getGetPlayerQueryKey, getGetPlayerStatsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { useAdmin } from "@/hooks/useAdmin";
import { TrendingUp, TrendingDown, Award, Target, Coins, ChevronRight, Flame, BarChart2, Percent, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";

export default function PlayerProfilePage() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0");
  const { adminMode } = useAdmin();

  const { data: player } = useGetPlayer(id, { query: { queryKey: getGetPlayerQueryKey(id), enabled: !!id } });
  const { data: stats } = useGetPlayerStats(id, { query: { queryKey: getGetPlayerStatsQueryKey(id), enabled: !!id } });

  if (!player) {
    return (
      <Layout adminMode={adminMode}>
        <div className="flex items-center justify-center h-full py-20 text-gray-400 text-sm">טוען...</div>
      </Layout>
    );
  }

  const profit = stats?.totalProfit || 0;
  const isWinner = profit > 0;
  const isLoser = profit < 0;
  const s = stats as any;

  const statCards = [
    { label: "משחקים", value: stats?.totalGames || 0, suffix: "", icon: Target, color: "text-blue-500", bg: "bg-blue-50 border-blue-100" },
    { label: "% ניצחון", value: (stats?.winRate || 0).toFixed(1), suffix: "%", icon: Award, color: "text-purple-500", bg: "bg-purple-50 border-purple-100" },
    { label: "רווח כולל", value: (profit > 0 ? "+" : "") + profit.toFixed(0), suffix: " ₪", icon: profit >= 0 ? TrendingUp : TrendingDown, color: isWinner ? "text-green-600" : isLoser ? "text-red-500" : "text-gray-400", bg: isWinner ? "bg-green-50 border-green-100" : isLoser ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100" },
    { label: "סה\"כ כניסות", value: (stats?.totalBuyins || 0).toFixed(0), suffix: " ₪", icon: Coins, color: "text-orange-500", bg: "bg-orange-50 border-orange-100" },
    { label: "ממוצע/משחק", value: (s?.avgProfit || 0) > 0 ? "+" + (s?.avgProfit || 0).toFixed(0) : (s?.avgProfit || 0).toFixed(0), suffix: " ₪", icon: BarChart2, color: (s?.avgProfit || 0) >= 0 ? "text-green-600" : "text-red-500", bg: (s?.avgProfit || 0) >= 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100" },
    { label: "ממוצע כניסה", value: (s?.avgBuyin || 0).toFixed(0), suffix: " ₪", icon: ArrowUpDown, color: "text-gray-500", bg: "bg-gray-50 border-gray-100" },
    { label: "ROI", value: (s?.roi || 0) > 0 ? "+" + (s?.roi || 0).toFixed(1) : (s?.roi || 0).toFixed(1), suffix: "%", icon: Percent, color: (s?.roi || 0) >= 0 ? "text-green-600" : "text-red-500", bg: (s?.roi || 0) >= 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100" },
    { label: "רצף ניצחונות", value: s?.longestWinStreak || 0, suffix: "🔥", icon: Flame, color: "text-orange-500", bg: "bg-orange-50 border-orange-100" },
  ];

  return (
    <Layout adminMode={adminMode}>
      <div className="p-4 max-w-xl mx-auto space-y-5 pb-8">

        <Link href="/players" className="flex items-center gap-1 text-gray-400 hover:text-gray-700 text-sm transition-colors justify-end" data-testid="link-back-players">
          שחקנים
          <ChevronRight className="w-4 h-4" />
        </Link>

        {/* Player header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className={`text-left flex-shrink-0 ${isWinner ? "text-green-600" : isLoser ? "text-red-500" : "text-gray-400"}`}>
              <div className="text-2xl font-black">{profit > 0 ? "+" : ""}{profit.toFixed(0)} ₪</div>
              <div className="text-xs text-gray-400 mt-0.5">רווח/הפסד כולל</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h1 className="text-gray-900 text-xl font-bold">{player.firstName} {player.lastName}</h1>
                <div className="text-gray-400 text-sm mt-0.5">{player.phone || "אין טלפון"}</div>
                {stats && stats.totalGames > 0 && (
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="text-xs text-red-500 font-bold">{s?.losses || 0} הפסד</span>
                    <span className="text-gray-300 text-xs">—</span>
                    <span className="text-xs text-green-600 font-bold">{s?.wins || 0} ניצחון</span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold text-lg">
                  {player.firstName[0]}{player.lastName?.[0] || ""}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-white border rounded-2xl p-4 shadow-sm ${card.bg}`}
            >
              <div className="flex items-center gap-1.5 mb-2 justify-end">
                <span className="text-gray-400 text-[10px] tracking-wider font-semibold">{card.label}</span>
                <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
              <div className={`text-2xl font-black text-right ${card.color}`}>
                {card.value}<span className="text-sm font-semibold">{card.suffix}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Session Records */}
        {stats && stats.totalGames > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="text-gray-400 text-xs tracking-wider font-bold mb-4 text-right">שיאי משחקים</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <div className="text-gray-400 text-xs mb-1">המשחק הגרוע ביותר</div>
                <div className="text-red-500 font-black text-xl">{stats.biggestLoss.toFixed(0)} ₪</div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-xs mb-1">המשחק הטוב ביותר</div>
                <div className="text-green-600 font-black text-xl">+{stats.biggestWin.toFixed(0)} ₪</div>
              </div>
              <div className="text-left">
                <div className="text-gray-400 text-xs mb-1">שיא רצף הפסדים</div>
                <div className="text-red-400 font-black text-xl">{s?.longestLossStreak || 0}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-xs mb-1">שיא רצף ניצחונות</div>
                <div className="text-orange-500 font-black text-xl flex items-center gap-1 justify-end">
                  <Flame className="w-4 h-4" />{s?.longestWinStreak || 0}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {(!stats || stats.totalGames === 0) && (
          <div className="text-center py-12 text-gray-300">
            <div className="font-cinzel text-xl mb-2">אין משחקים עדיין</div>
            <div className="text-sm text-gray-400">נתונים יופיעו לאחר משחק שהסתיים</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
