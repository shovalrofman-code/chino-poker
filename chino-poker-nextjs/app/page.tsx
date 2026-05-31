"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Plus, DoorClosed, Timer } from "lucide-react";

export default function TablePage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { adminMode, login } = useAdmin();

  const [modals, setModals] = useState({
    adminLogin: false,
    addPlayer: false,
    buyin: false,
    closeSession: false,
  });

  const [selectedPlayer, setSelectedPlayer] = useState<{
    playerId: number;
    firstName: string;
    lastName: string;
    totalBuyins: number;
  } | null>(null);

  const { data: activeSession } = useGetActiveSession({
    query: {
      queryKey: getGetActiveSessionQueryKey(),
      retry: false,
      refetchInterval: 60000,
    },
  });

  const { data: groupBalance } = useGetGroupBalance({
    query: { queryKey: getGetGroupBalanceQueryKey() },
  });

  const createSession = useCreateSession();
  const addPlayer = useAddPlayerToSession();
  const recordBuyin = useRecordBuyin();
  const closeSession = useCloseSession();

  const elapsed = useSessionTimer(activeSession?.startedAt);

  const toggleModal = (key: keyof typeof modals, val: boolean) =>
    setModals((prev) => ({ ...prev, [key]: val }));

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
    try {
      await closeSession.mutateAsync({ id: activeSession.id, data: { finalChips: finalChipsArray } });
      queryClient.setQueryData(getGetActiveSessionQueryKey(), null);
      router.push(`/settlement/${activeSession.id}`);
    } catch (e) {
      console.error("Failed to close session", e);
    }
  };

  const handleSeatClick = (player: any) => {
    if (!adminMode) return;
    setSelectedPlayer(player);
    toggleModal("buyin", true);
  };

  const tablePlayers =
    activeSession?.players?.map((sp) => ({
      playerId: sp.playerId,
      firstName: sp.player?.firstName || "",
      lastName: sp.player?.lastName || "",
      phone: sp.player?.phone || "",
      totalBuyins: sp.totalBuyins,
      finalChips: sp.finalChips,
    })) || [];

  const totalPot = tablePlayers.reduce((sum, p) => sum + p.totalBuyins, 0);

  return (
    <Layout adminMode={adminMode} onAdminClick={() => !adminMode && toggleModal("adminLogin", true)}>
      <div className="flex flex-col min-h-full bg-white">
        {activeSession && (
          <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="text-xs text-black">
                קופה: <span className="font-bold text-sm">{totalPot} ₪</span>
              </div>
              {adminMode && (
                <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  עמלה: {(groupBalance?.totalRake || 0).toFixed(0)} ₪
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-red-600" />
              <span className="font-mono text-sm font-bold">{elapsed}</span>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          {!activeSession ? (
            <div className="text-center space-y-8 w-full max-w-sm">
              <div className="poker-table-surface rounded-[150px] aspect-[2/1] w-full flex items-center justify-center">
                <div className="text-center text-white font-black text-3xl italic font-serif tracking-widest">
                  CHINO POKER
                </div>
              </div>
              
              <div className="flex flex-col gap-4 items-center">
                {adminMode ? (
                  <button
                    onClick={handleStartSession}
                    className="casino-btn px-12 py-4"
                  >
                    פתח שולחן חדש
                  </button>
                ) : (
                  <button
                    onClick={() => toggleModal("adminLogin", true)}
                    className="text-red-600 font-bold underline"
                  >
                    הקש קוד מנהל להתחלת משחק
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-lg flex flex-col items-center">
              <PokerTable players={tablePlayers} adminMode={adminMode} onSeatClick={handleSeatClick} />
              
              {adminMode && (
                <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-12">
                  <button
                    onClick={() => toggleModal("addPlayer", true)}
                    className="casino-btn flex-1 justify-center py-4 rounded-2xl"
                  >
                    הוסף שחקן <Plus size={20} />
                  </button>
                  <button
                    onClick={() => toggleModal("closeSession", true)}
                    className="bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                  >
                    סגור משחק <DoorClosed size={20} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AdminLoginModal
        open={modals.adminLogin}
        onClose={() => toggleModal("adminLogin", false)}
        onLogin={login}
      />
      <AddPlayerModal
        open={modals.addPlayer}
        onClose={() => toggleModal("addPlayer", false)}
        onAddPlayer={handleAddPlayer}
      />
      <BuyinModal
        open={modals.buyin}
        onClose={() => {
          toggleModal("buyin", false);
          setSelectedPlayer(null);
        }}
        player={selectedPlayer}
        onBuyin={handleBuyin}
      />
      {activeSession && (
        <CloseSessionModal
          open={modals.closeSession}
          onClose={() => toggleModal("closeSession", false)}
          players={tablePlayers}
          onClose2={handleCloseSession}
        />
      )}
    </Layout>
  );
}
