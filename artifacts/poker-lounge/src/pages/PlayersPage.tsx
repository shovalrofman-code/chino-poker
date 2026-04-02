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
          <div className="flex items-center gap-2">
            {adminMode && (
              <button
                onClick={() => setShowRegister(true)}
                className="casino-btn flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold tracking-wide"
                data-testid="button-register-player"
              >
                <UserPlus className="w-4 h-4" />
                הוסף שחקן
              </button>
            )}
          </div>
          <div className="text-right">
            <h1 className="font-cinzel text-gray-900 text-xl font-bold tracking-widest">שחקנים</h1>
            <p className="text-gray-400 text-xs mt-0.5">{filtered.length} רשומים</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="search"
            placeholder="חפש לפי שם או טלפון..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-4 py-3 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-right"
            data-testid="input-search-players"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                  className="flex items-center justify-between bg-white border border-gray-200 hover:border-red-300 hover:shadow-sm rounded-2xl p-4 transition-all cursor-pointer"
                  data-testid={`card-player-${player.id}`}
                >
                  <div className="text-left flex-shrink-0 ml-3">
                    {games > 0 ? (
                      <>
                        <div className={`font-bold text-sm flex items-center gap-1 ${profit > 0 ? "text-green-600" : profit < 0 ? "text-red-500" : "text-gray-400"}`}>
                          {profit > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : profit < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                          {profit > 0 ? "+" : ""}{profit.toFixed(0)} ₪
                        </div>
                        <div className="text-gray-400 text-xs">{games} משחקים · {winRate.toFixed(0)}% ניצחון</div>
                      </>
                    ) : (
                      <div className="text-gray-300 text-xs">אין משחקים</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0 text-right">
                      <div className="text-gray-900 font-semibold text-sm truncate">
                        {player.firstName} {player.lastName}
                      </div>
                      <div className="text-gray-400 text-xs truncate">{player.phone || "אין טלפון"}</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-sm">
                        {player.firstName[0]}{player.lastName?.[0] || ""}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && !search && (
          <div className="text-center py-16 text-gray-300">
            <div className="font-cinzel text-2xl mb-2 text-gray-300">אין שחקנים עדיין</div>
            {adminMode
              ? <button onClick={() => setShowRegister(true)} className="text-red-500 font-semibold text-sm underline">הוסף את השחקן הראשון</button>
              : <div className="text-sm text-gray-400">כנס כמנהל להוספת שחקנים</div>
            }
          </div>
        )}

        {filtered.length === 0 && search && (
          <div className="text-center py-10 text-gray-400 text-sm">
            לא נמצאו שחקנים עבור "{search}"
          </div>
        )}
      </div>

      <AdminLoginModal open={showAdminLogin} onClose={() => setShowAdminLogin(false)} onLogin={login} />
      <RegisterPlayerModal open={showRegister} onClose={() => { setShowRegister(false); refetch(); }} />
    </Layout>
  );
}
