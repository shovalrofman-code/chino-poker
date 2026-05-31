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
} from "@/lib/api-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { PokerTable } from "@/components/poker/PokerTable";
import { AddPlayerModal } from "@/components/features/AddPlayerModal";
import { BuyinModal } from "@/components/features/BuyinModal";
import { CloseSessionModal } from "@/components/features/CloseSessionModal";
import { AdminLoginModal } from "@/components/features/AdminLoginModal";
import { useAdmin } from "@/hooks/useAdmin";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { Layout } from "@/components/Layout";
import { Plus, DoorClosed, Timer } from "lucide-react";
import { handleError } from "@/lib/error-handler";

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
    try {
      await createSession.mutateAsync({ data: {} });
      queryClient.invalidateQueries({ queryKey: getGetActiveSessionQueryKey() });
    } catch (e) {
      handleError(e, "נכשל בפתיחת שולחן חדש");
    }
  };

  const handleAddPlayer = async (playerId: number, initialBuyin: number) => {
    if (!activeSession) return;
    try {
      await addPlayer.mutateAsync({ id: activeSession.id, data: { playerId, initialBuyin } });
      queryClient.invalidateQueries({ queryKey: getGetActiveSessionQueryKey() });
    } catch (e) {
      handleError(e, "נכשל בהוספת שחקן");
    }
  };

  const handleBuyin = async (playerId: number, amount: number) => {
    if (!activeSession) return;
    try {
      await recordBuyin.mutateAsync({ id: activeSession.id, data: { playerId, amount } });
      queryClient.invalidateQueries({ queryKey: getGetActiveSessionQueryKey() });
    } catch (e) {
      handleError(e, "נכשל ברישום כניסה");
    }
  };

  const handleUndoBuyin = async (buyinId: number) => {
    if (!activeSession) return;
    try {
      const res = await fetch(`/api/sessions/${activeSession.id}/buyins/${buyinId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("נכשל בביטול הכניסה");
      queryClient.invalidateQueries({ queryKey: getGetActiveSessionQueryKey() });
    } catch (e) {
      handleError(e, "נכשל בביטול הכניסה");
    }
  };

  const handleCloseSession = async (finalChipsArray: Array<{ playerId: number; chips: number }>) => {
    if (!activeSession) return;
    try {
      if (finalChipsArray.length === 0) {
        // If the game is empty, delete it instead of closing/saving it
        await fetch(`/api/sessions/${activeSession.id}`, { method: "DELETE" });
        queryClient.setQueryData(getGetActiveSessionQueryKey(), null);
        // Stay on home page
      } else {
        await closeSession.mutateAsync({ id: activeSession.id, data: { finalChips: finalChipsArray } });
        queryClient.setQueryData(getGetActiveSessionQueryKey(), null);
        router.push(`/settlement/${activeSession.id}`);
      }
    } catch (e) {
      handleError(e, "נכשל בסגירת המשחק");
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
      buyins: sp.buyins,
    })) || [];

  const totalPot = tablePlayers.reduce((sum, p) => sum + p.totalBuyins, 0);

  return (
    <Layout adminMode={adminMode} onAdminClick={() => !adminMode && toggleModal("adminLogin", true)}>
      <div className="flex flex-col min-h-full bg-white">
        {activeSession && (
          <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-[57px] z-40 shadow-sm">
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
            <div className="text-center space-y-10 w-full max-w-sm">
              <div className="relative">
                <div className="poker-table-surface rounded-[150px] aspect-[2/1] w-full flex items-center justify-center shadow-2xl">
                  <div className="text-center text-white font-black text-4xl italic font-serif tracking-[0.2em] drop-shadow-lg">
                    CHINO
                  </div>
                </div>
                {/* Decorative Cards */}
                <div className="absolute -bottom-6 start-1/2 -translate-x-1/2 flex gap-1 transform rotate-2">
                   <div className="w-12 h-16 bg-white rounded-lg shadow-xl border border-gray-100 flex items-center justify-center transform -rotate-12 translate-y-2">
                     <span className="text-red-600 font-black text-xl">A</span>
                   </div>
                   <div className="w-12 h-16 bg-white rounded-lg shadow-xl border border-gray-100 flex items-center justify-center transform rotate-6">
                     <span className="text-black font-black text-xl">K</span>
                   </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-6 items-center pt-8">
                {adminMode ? (
                  <button
                    onClick={handleStartSession}
                    className="casino-btn px-16 py-5 text-xl"
                  >
                    פתח שולחן חדש
                  </button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">אין משחק פעיל כרגע</p>
                    <button
                      onClick={() => toggleModal("adminLogin", true)}
                      className="text-red-600 font-black text-sm uppercase tracking-widest border-b-2 border-red-600 pb-1 active:scale-95 transition-transform"
                    >
                      כניסת מנהל
                    </button>
                  </div>
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
        onUndoBuyin={handleUndoBuyin}
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
