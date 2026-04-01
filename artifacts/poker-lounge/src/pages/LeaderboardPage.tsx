import { Link } from "wouter";
import { useGetLeaderboard, useGetGroupBalance, getGetLeaderboardQueryKey, getGetGroupBalanceQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { useState } from "react";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
  const { adminMode, login } = useAdmin();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const { data: leaderboard } = useGetLeaderboard({ query: { queryKey: getGetLeaderboardQueryKey() } });
  const { data: groupBalance } = useGetGroupBalance({ query: { queryKey: getGetGroupBalanceQueryKey() } });

  const medalColors = ["text-[#D4AF37]", "text-gray-300", "text-amber-600"];

  return (
    <Layout adminMode={adminMode} onAdminClick={() => !adminMode && setShowAdminLogin(true)}>
      <div className="p-4 max-w-2xl mx-auto space-y-5">
        <div className="pt-2">
          <h1 className="font-cinzel text-[#D4AF37] text-xl font-bold tracking-widest">LEADERBOARD</h1>
          <p className="text-gray-500 text-xs mt-1">All-time rankings</p>
        </div>

        {/* Group Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#0d0d0d] to-[#111] border border-[#D4AF37]/30 rounded-2xl p-5 text-center"
        >
          <div className="text-gray-400 text-xs tracking-widest font-bold mb-2">GROUP TREASURY</div>
          <div className="text-[#D4AF37] text-4xl font-cinzel font-black">
            {(groupBalance?.totalRake || 0).toFixed(0)} ₪
          </div>
          <div className="text-gray-600 text-xs mt-1">
            from {groupBalance?.sessionsCount || 0} sessions
          </div>
        </motion.div>

        {/* Leaderboard */}
        <div className="space-y-2">
          {leaderboard?.map((player, i) => (
            <motion.div
              key={player.playerId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/player/${player.playerId}`}
                className="flex items-center gap-4 bg-[#111] border border-[#222] hover:border-[#D4AF37]/20 rounded-xl p-4 transition-all"
                data-testid={`leaderboard-row-${player.playerId}`}
              >
                  {/* Rank */}
                  <div className={`text-xl font-black font-cinzel w-8 text-center ${medalColors[i] || "text-gray-600"}`}>
                    {i < 3 ? (
                      <Trophy className={`w-5 h-5 mx-auto ${medalColors[i]}`} />
                    ) : (
                      <span className="text-gray-600">#{i + 1}</span>
                    )}
                  </div>

                  {/* Player info */}
                  <div className="flex-1">
                    <div className="text-white font-semibold">{player.firstName} {player.lastName}</div>
                    <div className="text-gray-500 text-xs">{player.totalGames} games • {player.winRate.toFixed(0)}% wins</div>
                  </div>

                  {/* Profit */}
                  <div className="text-right">
                    <div className={`font-black text-lg flex items-center gap-1 justify-end ${player.totalProfit > 0 ? "text-green-400" : player.totalProfit < 0 ? "text-red-400" : "text-gray-400"}`}>
                      {player.totalProfit > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {player.totalProfit > 0 ? "+" : ""}{player.totalProfit.toFixed(0)} ₪
                    </div>
                  </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {(!leaderboard || leaderboard.length === 0) && (
          <div className="text-center py-16 text-gray-600">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <div className="font-cinzel text-xl mb-2">No rankings yet</div>
            <div className="text-sm">Complete a session to see the leaderboard</div>
          </div>
        )}
      </div>

      <AdminLoginModal open={showAdminLogin} onClose={() => setShowAdminLogin(false)} onLogin={login} />
    </Layout>
  );
}
