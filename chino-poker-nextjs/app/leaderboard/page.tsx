"use client";

import Link from "next/link";
import { useGetLeaderboard, useGetGroupBalance, getGetLeaderboardQueryKey, getGetGroupBalanceQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { useState } from "react";
import { Trophy, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
  const { adminMode, login } = useAdmin();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const { data: leaderboard } = useGetLeaderboard({ query: { queryKey: getGetLeaderboardQueryKey() } });
  const { data: groupBalance } = useGetGroupBalance({ query: { queryKey: getGetGroupBalanceQueryKey() } });

  return (
    <Layout adminMode={adminMode} onAdminClick={() => !adminMode && setShowAdminLogin(true)}>
      <div className="p-4 max-w-xl mx-auto space-y-4 pb-8">
        <div className="pt-2 text-right">
          <h1 className="font-cinzel text-gray-900 text-xl font-bold tracking-widest">טבלת מובילים</h1>
          <p className="text-gray-400 text-xs mt-0.5">דירוג כל הזמנים</p>
        </div>

        {/* Group Treasury Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-600 rounded-2xl p-5 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-red-200" />
            <div className="text-red-100 text-xs font-bold tracking-widest">קופת הקבוצה</div>
          </div>
          <div className="text-white text-4xl font-cinzel font-black">
            {(groupBalance?.totalRake || 0).toFixed(0)} ₪
          </div>
          <div className="text-red-200 text-xs mt-1">
            מ-{groupBalance?.sessionsCount || 0} משחקים
          </div>
        </motion.div>

        {/* Rankings */}
        <div className="space-y-2">
          {leaderboard?.map((player, i) => (
            <motion.div
              key={player.playerId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/player/${player.playerId}`}
                className="flex items-center gap-3 bg-white border border-gray-200 hover:border-red-300 hover:shadow-sm rounded-2xl p-4 transition-all"
                data-testid={`leaderboard-row-${player.playerId}`}
              >
                {/* Profit */}
                <div className={`font-black text-base flex items-center gap-1 flex-shrink-0 ${player.totalProfit > 0 ? "text-green-600" : player.totalProfit < 0 ? "text-red-500" : "text-gray-400"}`}>
                  {player.totalProfit > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {player.totalProfit > 0 ? "+" : ""}{player.totalProfit.toFixed(0)} ₪
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-gray-900 font-semibold text-sm truncate">{player.firstName} {player.lastName}</div>
                  <div className="text-gray-400 text-xs">{player.totalGames} משחקים · {player.winRate.toFixed(0)}% ניצחון</div>
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-bold text-sm">
                    {player.firstName[0]}{player.lastName?.[0] || ""}
                  </span>
                </div>

                {/* Rank badge */}
                <div className="w-8 flex-shrink-0 text-center">
                  {i === 0 ? <Trophy className="w-5 h-5 mx-auto text-yellow-500" />
                    : i === 1 ? <Trophy className="w-5 h-5 mx-auto text-gray-400" />
                    : i === 2 ? <Trophy className="w-5 h-5 mx-auto text-amber-700" />
                    : <span className="text-gray-400 font-bold text-sm">#{i + 1}</span>
                  }
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {(!leaderboard || leaderboard.length === 0) && (
          <div className="text-center py-16">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <div className="font-cinzel text-gray-300 text-xl mb-1">אין דירוג עדיין</div>
            <div className="text-gray-400 text-sm">סיים משחק לצפייה בדירוג</div>
          </div>
        )}
      </div>

      <AdminLoginModal open={showAdminLogin} onClose={() => setShowAdminLogin(false)} onLogin={login} />
    </Layout>
  );
}
