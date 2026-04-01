import { useState } from "react";
import { Link } from "wouter";
import { useListPlayers, useGetLeaderboard, getListPlayersQueryKey, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

export default function PlayersPage() {
  const { adminMode, login } = useAdmin();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [search, setSearch] = useState("");

  const { data: players } = useListPlayers({ query: { queryKey: getListPlayersQueryKey() } });
  const { data: leaderboard } = useGetLeaderboard({ query: { queryKey: getGetLeaderboardQueryKey() } });

  const filtered = players?.filter(p =>
    !p.isGuest && (
      p.firstName.toLowerCase().includes(search.toLowerCase()) ||
      p.lastName.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
    )
  ) || [];

  const statsMap = new Map(leaderboard?.map(s => [s.playerId, s]) || []);

  return (
    <Layout adminMode={adminMode} onAdminClick={() => !adminMode && setShowAdminLogin(true)}>
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="pt-2">
          <h1 className="font-cinzel text-[#D4AF37] text-xl font-bold tracking-widest">PLAYER DATABASE</h1>
          <p className="text-gray-500 text-xs mt-1">{filtered.length} registered players</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="search"
            placeholder="Search by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-[#333] rounded-lg pl-9 pr-4 py-2.5 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-red-700 transition-colors"
            data-testid="input-search-players"
          />
        </div>

        {/* Players list */}
        <div className="space-y-2">
          {filtered.map((player, i) => {
            const stats = statsMap.get(player.id);
            const profit = stats?.totalProfit || 0;
            const games = stats?.totalGames || 0;
            const winRate = stats?.winRate || 0;

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={`/player/${player.id}`}
                  className="block bg-[#111] border border-[#222] hover:border-[#D4AF37]/30 rounded-xl p-4 transition-all cursor-pointer"
                  data-testid={`card-player-${player.id}`}
                >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-white font-semibold">
                          {player.firstName} {player.lastName}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5">{player.phone}</div>
                      </div>
                      <div className="text-right">
                        {games > 0 ? (
                          <>
                            <div className={`font-bold text-sm flex items-center gap-1 justify-end ${profit > 0 ? "text-green-400" : profit < 0 ? "text-red-400" : "text-gray-400"}`}>
                              {profit > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : profit < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                              {profit > 0 ? "+" : ""}{profit.toFixed(0)} ₪
                            </div>
                            <div className="text-gray-500 text-xs mt-0.5">{games} games • {winRate.toFixed(0)}% wins</div>
                          </>
                        ) : (
                          <div className="text-gray-600 text-xs">No games yet</div>
                        )}
                      </div>
                    </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && !search && (
          <div className="text-center py-16 text-gray-600">
            <div className="font-cinzel text-2xl mb-2">No players yet</div>
            <div className="text-sm">Players appear here after joining a session</div>
          </div>
        )}

        {filtered.length === 0 && search && (
          <div className="text-center py-10 text-gray-600 text-sm">
            No players found for "{search}"
          </div>
        )}
      </div>

      <AdminLoginModal open={showAdminLogin} onClose={() => setShowAdminLogin(false)} onLogin={login} />
    </Layout>
  );
}
