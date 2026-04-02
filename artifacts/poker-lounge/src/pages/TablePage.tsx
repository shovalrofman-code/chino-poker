import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetActiveSession,
  useCreateSession,
  useAddPlayerToSession,
  useRecordBuyin,
  useCloseSession,
  useGetGroupBalance,
  getGetActiveSessionQueryKey,
  getGetGroupBalanceQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { PokerTable } from "@/components/PokerTable";
import { AddPlayerModal } from "@/components/AddPlayerModal";
import { BuyinModal } from "@/components/BuyinModal";
import { CloseSessionModal } from "@/components/CloseSessionModal";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { useAdmin } from "@/hooks/useAdmin";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { Layout } from "@/components/Layout";
import { Plus, DoorClosed, LogOut, Timer, Wallet, History, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function deleteBuyin(sessionId: number, buyinId: number) {
  return fetch(`${BASE}/api/sessions/${sessionId}/buyins/${buyinId}`, { method: "DELETE" }).then(r => r.json());
}

export default function TablePage() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { adminMode, login, logout } = useAdmin();

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showBuyin, setShowBuyin] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{
    playerId: number; firstName: string; lastName: string; totalBuyins: number;
  } | null>(null);

  const { data: activeSession, isLoading } = useGetActiveSession({
    query: { queryKey: getGetActiveSessionQueryKey(), retry: false, refetchInterval: 8000 }
  });

  const { data: groupBalance } = useGetGroupBalance({
    query: { queryKey: getGetGroupBalanceQueryKey(), refetchInterval: 15000 }
  });

  const createSession = useCreateSession();
  const addPlayer = useAddPlayerToSession();
  const recordBuyin = useRecordBuyin();
  const closeSession = useCloseSession();

  const deleteBuyinMutation = useMutation({
    mutationFn: ({ sessionId, buyinId }: { sessionId: number; buyinId: number }) =>
      deleteBuyin(sessionId, buyinId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetActiveSessionQueryKey() }),
  });

  const elapsed = useSessionTimer(activeSession?.startedAt);

  const handleStartSession = async () => {
    await createSession.mutateAsync({ data: {} });
    queryClient.invalidateQueries({ queryKey: getGetActiveSessionQueryKey() });
  };

  const handleAddPlayer = async (playerId: number, initialBuyin: number) => {
    if (!activeSession) return;
    await addPlayer.mutateAsync({ id: activeSession.id, data: { playerId, initialBuyin } });
    queryClient.invalidateQueries({ queryKey: getGetActiveSessionQueryKey() });
  };

  const handleBuyin = async (playerId: number, amount: number) => {
    if (!activeSession) return;
    await recordBuyin.mutateAsync({ id: activeSession.id, data: { playerId, amount } });
    queryClient.invalidateQueries({ queryKey: getGetActiveSessionQueryKey() });
  };

  const handleCloseSession = async (finalChipsArray: Array<{ playerId: number; chips: number }>) => {
    if (!activeSession) return;
    await closeSession.mutateAsync({ id: activeSession.id, data: { finalChips: finalChipsArray } });
    queryClient.invalidateQueries({ queryKey: getGetActiveSessionQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetGroupBalanceQueryKey() });
    navigate(`/settlement/${activeSession.id}`);
  };

  const handleSeatClick = (player: { playerId: number; firstName: string; lastName: string; totalBuyins: number }) => {
    if (!adminMode) return;
    setSelectedPlayer(player);
    setShowBuyin(true);
  };

  const tablePlayers = activeSession?.players?.map(sp => ({
    playerId: sp.playerId,
    firstName: sp.player?.firstName || "",
    lastName: sp.player?.lastName || "",
    phone: sp.player?.phone || "",
    totalBuyins: sp.totalBuyins,
    finalChips: sp.finalChips,
  })) || [];

  // Collect all buy-ins from all players, sorted newest first
  const allBuyins = (activeSession?.players || [])
    .flatMap(sp => (sp.buyins || []).map(b => ({
      ...b,
      playerName: `${sp.player?.firstName || ""} ${sp.player?.lastName || ""}`.trim(),
    })))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const totalPot = tablePlayers.reduce((s, p) => s + p.totalBuyins, 0);

  return (
    <Layout adminMode={adminMode} onAdminClick={() => !adminMode && setShowAdminLogin(true)}>
      <div className="flex flex-col min-h-full">

        {/* Session info bar */}
        {activeSession && (
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-mono text-gray-900 font-bold text-sm">{elapsed}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Timer className="w-3.5 h-3.5" />
                <span>{tablePlayers.length} / 9 seats</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Pot counter */}
              <div className="text-xs text-gray-500">
                Pot: <span className="text-gray-900 font-bold">{totalPot} ₪</span>
              </div>
              {/* Rake — admin only */}
              {adminMode && (
                <div className="flex items-center gap-1 bg-red-50 border border-red-100 rounded-full px-2.5 py-0.5">
                  <Wallet className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-600 font-bold">
                    {(groupBalance?.totalRake || 0).toFixed(0)} ₪ rake
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-5">
          {isLoading ? (
            <div className="text-gray-400 text-sm animate-pulse">Loading...</div>
          ) : !activeSession ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6 w-full"
            >
              <div className="w-full max-w-xs mx-auto">
                <div
                  className="poker-table rounded-[50%] mx-auto flex items-center justify-center"
                  style={{ width: 280, height: 164 }}
                >
                  <div className="text-center">
                    <div className="logo-shimmer font-cinzel font-black text-lg tracking-widest mb-1">
                      CHINO POKER
                    </div>
                    <div className="w-12 h-px bg-white/30 mx-auto mb-2" />
                    <div className="text-white/60 text-xs">No active session</div>
                  </div>
                </div>
              </div>

              {adminMode ? (
                <button
                  onClick={handleStartSession}
                  disabled={createSession.isPending}
                  className="casino-btn font-bold tracking-widest px-10 py-3.5 rounded-xl text-sm"
                  data-testid="button-start-session"
                >
                  {createSession.isPending ? "Starting..." : "START SESSION"}
                </button>
              ) : (
                <p className="text-gray-400 text-sm">
                  <button onClick={() => setShowAdminLogin(true)} className="text-red-600 font-semibold hover:underline" data-testid="button-admin-login-link">
                    Admin login
                  </button>{" "}required to start a session
                </p>
              )}
            </motion.div>
          ) : (
            <>
              <PokerTable
                players={tablePlayers}
                adminMode={adminMode}
                onSeatClick={adminMode ? handleSeatClick : undefined}
                selectedPlayerId={selectedPlayer?.playerId}
              />

              {adminMode && tablePlayers.length > 0 && (
                <p className="text-gray-400 text-xs text-center">Tap a seat to add buy-in</p>
              )}

              {/* Admin action bar */}
              {adminMode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center justify-center gap-2 w-full max-w-sm"
                >
                  <button
                    onClick={() => setShowAddPlayer(true)}
                    className="casino-btn font-bold tracking-wider px-5 py-2.5 rounded-xl text-sm flex items-center gap-1.5 flex-1"
                    disabled={tablePlayers.length >= 9}
                    data-testid="button-add-player"
                  >
                    <Plus className="w-4 h-4" />
                    ADD PLAYER
                  </button>
                  <button
                    onClick={() => setShowClose(true)}
                    className="sec-btn font-bold tracking-wider px-5 py-2.5 rounded-xl text-sm flex items-center gap-1.5 flex-1"
                    data-testid="button-close-session"
                  >
                    <DoorClosed className="w-4 h-4" />
                    CLOSE
                  </button>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => setShowLog(v => !v)}
                      className="sec-btn font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 flex-1"
                      data-testid="button-activity-log"
                    >
                      <History className="w-3.5 h-3.5" />
                      Activity Log
                      {showLog ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                    </button>
                    <button
                      onClick={logout}
                      className="text-gray-400 hover:text-red-600 text-xs tracking-wider px-3 py-2 flex items-center gap-1 transition-colors"
                      data-testid="button-admin-logout"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Activity Log Panel */}
              <AnimatePresence>
                {showLog && adminMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full max-w-sm overflow-hidden"
                  >
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3">
                      <div className="text-xs font-bold text-gray-500 tracking-wider mb-2 px-1">
                        RECENT BUY-INS {allBuyins.length > 0 && `(${allBuyins.length})`}
                      </div>
                      {allBuyins.length === 0 ? (
                        <div className="text-center py-4 text-gray-400 text-xs">No buy-ins recorded yet</div>
                      ) : (
                        <div className="space-y-1.5 max-h-52 overflow-y-auto">
                          {allBuyins.map(b => (
                            <div
                              key={b.id}
                              className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2"
                            >
                              <div>
                                <span className="text-gray-900 font-semibold text-xs">{b.playerName}</span>
                                <span className="text-gray-400 text-xs ml-2">+{b.amount} ₪</span>
                              </div>
                              <button
                                onClick={() => {
                                  if (activeSession) {
                                    deleteBuyinMutation.mutate({ sessionId: activeSession.id, buyinId: b.id });
                                  }
                                }}
                                className="text-gray-300 hover:text-red-500 transition-colors ml-2 p-1 rounded"
                                title="Undo this buy-in"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      <AdminLoginModal open={showAdminLogin} onClose={() => setShowAdminLogin(false)} onLogin={login} />
      <AddPlayerModal open={showAddPlayer} onClose={() => setShowAddPlayer(false)} onAddPlayer={handleAddPlayer} />
      <BuyinModal
        open={showBuyin}
        onClose={() => { setShowBuyin(false); setSelectedPlayer(null); }}
        player={selectedPlayer}
        onBuyin={handleBuyin}
      />
      {activeSession && (
        <CloseSessionModal
          open={showClose}
          onClose={() => setShowClose(false)}
          players={tablePlayers.map(p => ({ playerId: p.playerId, firstName: p.firstName, lastName: p.lastName, totalBuyins: p.totalBuyins }))}
          onClose2={handleCloseSession}
        />
      )}
    </Layout>
  );
}
