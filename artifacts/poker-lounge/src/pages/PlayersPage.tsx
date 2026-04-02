import { useState } from "react";
import { Link } from "wouter";
import { useListPlayers, useGetLeaderboard, getListPlayersQueryKey, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { RegisterPlayerModal } from "@/components/RegisterPlayerModal";
import { Search, TrendingUp, TrendingDown, Minus, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

export default function PlayersPage() {
  const { adminMode, login } = useAdmin();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [search, setSearch] = useState("");

  const { data: players, refetch } = useListPlayers({ query: { queryKey: getListPlayersQueryKey() } });
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
      <div className="p-4 max-w-xl mx-auto space-y-4 pb-8">

        {/* Header */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <h1 className="font-cinzel text-gray-900 text-xl font-bold tracking-widest">PLAYERS</h1>
            <p className="text-gray-400 text-xs mt-0.5">{filtered.length} registered</p>
          </div>
          {adminMode && (
            <button
              onClick={() => setShowRegister(true)}
              className="casino-btn flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold tracking-wide"
              data-testid="button-register-player"
            >
              <UserPlus className="w-4 h-4" />
              Add Player
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
            data-testid="input-search-players"
          />
        </div>

        {/* Player list */}
        <div className="space-y-2">
          {filtered.map((player, i) => {
            const stats = statsMap.get(player.id);
            const profit = stats?.totalProfit || 0;
            const games = stats?.totalGames || 0;
            const winRate = stats?.winRate || 0;

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.025 }}
              >
                <Link
                  href={`/player/${player.id}`}
                  className="flex items-center justify-between bg-white border border-gray-200 hover:border-red-300 hover:shadow-sm rounded-2xl p-4 transition-all cursor-pointer block"
                  data-testid={`card-player-${player.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-sm">
                        {player.firstName[0]}{player.lastName?.[0] || ""}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-gray-900 font-semibold text-sm truncate">
                        {player.firstName} {player.lastName}
                      </div>
                      <div className="text-gray-400 text-xs truncate">{player.phone || "No phone"}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    {games > 0 ? (
                      <>
                        <div className={`font-bold text-sm flex items-center gap-1 justify-end ${profit > 0 ? "text-green-600" : profit < 0 ? "text-red-500" : "text-gray-400"}`}>
                          {profit > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : profit < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                          {profit > 0 ? "+" : ""}{profit.toFixed(0)} ₪
                        </div>
                        <div className="text-gray-400 text-xs">{games}g · {winRate.toFixed(0)}%W</div>
                      </>
                    ) : (
                      <div className="text-gray-300 text-xs">No games</div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && !search && (
          <div className="text-center py-16 text-gray-300">
            <div className="font-cinzel text-2xl mb-2 text-gray-300">No players yet</div>
            {adminMode
              ? <button onClick={() => setShowRegister(true)} className="text-red-500 font-semibold text-sm underline">Add your first player</button>
              : <div className="text-sm text-gray-400">Login as admin to add players</div>
            }
          </div>
        )}

        {filtered.length === 0 && search && (
          <div className="text-center py-10 text-gray-400 text-sm">
            No players match "{search}"
          </div>
        )}
      </div>

      <AdminLoginModal open={showAdminLogin} onClose={() => setShowAdminLogin(false)} onLogin={login} />
      <RegisterPlayerModal open={showRegister} onClose={() => { setShowRegister(false); refetch(); }} />
    </Layout>
  );
}
