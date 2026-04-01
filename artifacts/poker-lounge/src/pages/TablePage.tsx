import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
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
import { useQueryClient } from "@tanstack/react-query";
import { PokerTable } from "@/components/PokerTable";
import { AddPlayerModal } from "@/components/AddPlayerModal";
import { BuyinModal } from "@/components/BuyinModal";
import { CloseSessionModal } from "@/components/CloseSessionModal";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { useAdmin } from "@/hooks/useAdmin";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { Layout } from "@/components/Layout";
import { Plus, DoorClosed, LogOut, Timer, Wallet } from "lucide-react";

export default function TablePage() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { adminMode, login, logout } = useAdmin();

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showBuyin, setShowBuyin] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{
    playerId: number; firstName: string; lastName: string; totalBuyins: number;
  } | null>(null);

  const { data: activeSession, isLoading } = useGetActiveSession({
    query: { queryKey: getGetActiveSessionQueryKey(), retry: false }
  });

  const { data: groupBalance } = useGetGroupBalance({
    query: { queryKey: getGetGroupBalanceQueryKey() }
  });

  const createSession = useCreateSession();
  const addPlayer = useAddPlayerToSession();
  const recordBuyin = useRecordBuyin();
  const closeSession = useCloseSession();

  const elapsed = useSessionTimer(activeSession?.startedAt);

  const handleStartSession = async () => {
    await createSession.mutateAsync({ data: {} });
    queryClient.invalidateQueries({ queryKey: getGetActiveSessionQueryKey() });
  };

  const handleAddPlayer = async (playerId: number, initialBuyin: number) => {
    if (!activeSession) return;
    await addPlayer.mutateAsync({
      id: activeSession.id,
      data: { playerId, initialBuyin },
    });
    queryClient.invalidateQueries({ queryKey: getGetActiveSessionQueryKey() });
  };

  const handleBuyin = async (playerId: number, amount: number) => {
    if (!activeSession) return;
    await recordBuyin.mutateAsync({
      id: activeSession.id,
      data: { playerId, amount },
    });
    queryClient.invalidateQueries({ queryKey: getGetActiveSessionQueryKey() });
  };

  const handleCloseSession = async (finalChipsArray: Array<{ playerId: number; chips: number }>) => {
    if (!activeSession) return;
    await closeSession.mutateAsync({
      id: activeSession.id,
      data: { finalChips: finalChipsArray },
    });
    queryClient.invalidateQueries({ queryKey: getGetActiveSessionQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetGroupBalanceQueryKey() });
    navigate(`/settlement/${activeSession.id}`);
  };

  const handleSeatClick = (player: {
    playerId: number; firstName: string; lastName: string; totalBuyins: number;
  }) => {
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

  return (
    <Layout
      adminMode={adminMode}
      onAdminClick={() => !adminMode && setShowAdminLogin(true)}
    >
      <div className="flex flex-col h-full">
        {/* Session info bar */}
        {activeSession && (
          <div className="bg-[#0d0d0d] border-b border-[#222] px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Timer className="w-3.5 h-3.5 text-red-500" />
                <span className="font-mono text-white font-bold">{elapsed}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <span>{tablePlayers.length} players</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Wallet className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Group Rake: <span className="text-[#D4AF37] font-bold">{groupBalance?.totalRake?.toFixed(0) || 0} ₪</span></span>
            </div>
          </div>
        )}

        {/* Main table area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
          {isLoading ? (
            <div className="text-gray-500 text-sm animate-pulse">Loading...</div>
          ) : !activeSession ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              {/* Empty table visual */}
              <div className="relative w-[600px] max-w-full mx-auto">
                <div
                  className="poker-table rounded-[50%] mx-auto flex items-center justify-center"
                  style={{ width: 480, height: 280 }}
                >
                  <div className="text-center">
                    <div className="logo-shimmer font-cinzel font-black text-2xl tracking-widest mb-2">
                      THE POKER LOUNGE
                    </div>
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mb-4" />
                    <div className="text-gray-400 text-sm">No active session</div>
                  </div>
                </div>
              </div>

              {adminMode ? (
                <button
                  onClick={handleStartSession}
                  disabled={createSession.isPending}
                  className="casino-btn text-white font-bold tracking-widest px-10 py-4 rounded-lg text-sm"
                  data-testid="button-start-session"
                >
                  {createSession.isPending ? "STARTING..." : "START SESSION"}
                </button>
              ) : (
                <div className="text-gray-500 text-sm">
                  <button
                    onClick={() => setShowAdminLogin(true)}
                    className="text-red-500 hover:text-red-400 underline"
                    data-testid="button-admin-login-link"
                  >
                    Admin login
                  </button>
                  {" "}required to start a session
                </div>
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

              {/* Admin controls */}
              {adminMode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center justify-center gap-3"
                >
                  <button
                    onClick={() => setShowAddPlayer(true)}
                    className="casino-btn text-white font-bold tracking-wider px-5 py-2.5 rounded-lg text-sm flex items-center gap-2"
                    disabled={tablePlayers.length >= 9}
                    data-testid="button-add-player"
                  >
                    <Plus className="w-4 h-4" />
                    ADD PLAYER
                  </button>
                  <button
                    onClick={() => setShowClose(true)}
                    className="bg-[#1a1a1a] border border-[#444] hover:border-red-700 text-gray-300 hover:text-white font-bold tracking-wider px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors"
                    data-testid="button-close-session"
                  >
                    <DoorClosed className="w-4 h-4" />
                    CLOSE SESSION
                  </button>
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-gray-400 text-xs tracking-wider px-3 py-2 flex items-center gap-1 transition-colors"
                    data-testid="button-admin-logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    LOGOUT
                  </button>
                </motion.div>
              )}

              {/* Click instruction for admin */}
              {adminMode && tablePlayers.length > 0 && (
                <p className="text-gray-600 text-xs text-center tracking-wider">
                  Tap a seat to add buy-in
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <AdminLoginModal
        open={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLogin={login}
      />
      <AddPlayerModal
        open={showAddPlayer}
        onClose={() => setShowAddPlayer(false)}
        onAddPlayer={handleAddPlayer}
      />
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
          players={tablePlayers.map(p => ({
            playerId: p.playerId,
            firstName: p.firstName,
            lastName: p.lastName,
            totalBuyins: p.totalBuyins,
          }))}
          onClose2={handleCloseSession}
        />
      )}
    </Layout>
  );
}
