import { useParams } from "wouter";
import { Link } from "wouter";
import { useGetPlayer, useGetPlayerStats, getGetPlayerQueryKey, getGetPlayerStatsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { useAdmin } from "@/hooks/useAdmin";
import { TrendingUp, TrendingDown, Award, Target, Coins, ChevronLeft } from "lucide-react";
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
        <div className="flex items-center justify-center h-full py-20">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    );
  }

  const profit = stats?.totalProfit || 0;
  const isWinner = profit > 0;
  const isLoser = profit < 0;

  const statCards = [
    {
      label: "TOTAL GAMES",
      value: stats?.totalGames || 0,
      suffix: "",
      icon: Target,
      color: "text-blue-400",
    },
    {
      label: "WIN RATE",
      value: (stats?.winRate || 0).toFixed(1),
      suffix: "%",
      icon: Award,
      color: "text-[#D4AF37]",
    },
    {
      label: "TOTAL PROFIT",
      value: (profit > 0 ? "+" : "") + profit.toFixed(0),
      suffix: " ₪",
      icon: profit >= 0 ? TrendingUp : TrendingDown,
      color: isWinner ? "text-green-400" : isLoser ? "text-red-400" : "text-gray-400",
    },
    {
      label: "TOTAL BUY-INS",
      value: (stats?.totalBuyins || 0).toFixed(0),
      suffix: " ₪",
      icon: Coins,
      color: "text-purple-400",
    },
  ];

  return (
    <Layout adminMode={adminMode}>
      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Back button */}
        <Link href="/players" className="flex items-center gap-1 text-gray-500 hover:text-white text-sm transition-colors" data-testid="link-back-players">
          <ChevronLeft className="w-4 h-4" />
          Players
        </Link>

        {/* Player header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111] border border-[#222] rounded-2xl p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-white text-2xl font-bold">{player.firstName} {player.lastName}</h1>
              <div className="text-gray-500 text-sm mt-1">{player.phone}</div>
            </div>
            <div className={`text-right ${isWinner ? "text-green-400" : isLoser ? "text-red-400" : "text-gray-400"}`}>
              <div className="text-2xl font-bold">
                {profit > 0 ? "+" : ""}{profit.toFixed(0)} ₪
              </div>
              <div className="text-xs text-gray-500 mt-1">Lifetime P/L</div>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#111] border border-[#222] rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <card.icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-gray-500 text-xs tracking-wider">{card.label}</span>
              </div>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}<span className="text-base">{card.suffix}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Best/Worst session */}
        {stats && stats.totalGames > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-3"
          >
            <div className="text-gray-400 text-xs tracking-wider font-semibold">SESSION RECORDS</div>
            <div className="flex justify-between">
              <div>
                <div className="text-gray-500 text-xs">Best Session</div>
                <div className="text-green-400 font-bold text-lg">+{stats.biggestWin.toFixed(0)} ₪</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500 text-xs">Worst Session</div>
                <div className="text-red-400 font-bold text-lg">{stats.biggestLoss.toFixed(0)} ₪</div>
              </div>
            </div>
          </motion.div>
        )}

        {(!stats || stats.totalGames === 0) && (
          <div className="text-center py-10 text-gray-600">
            <div className="font-cinzel text-xl mb-2">No sessions yet</div>
            <div className="text-sm">Stats will appear after completing a session</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
