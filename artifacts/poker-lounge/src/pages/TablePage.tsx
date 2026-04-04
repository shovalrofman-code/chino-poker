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

  // רענון כל 60 שניות למניעת קפיצות
  const { data: activeSession, isLoading } = useGetActiveSession({
    query: { 
      queryKey: getGetActiveSessionQueryKey(), 
      retry: false, 
      refetchInterval: 60000, 
      staleTime: 30000 
    }
  });

  const { data: groupBalance } = useGetGroupBalance({
    query: { queryKey: getGetGroupBalanceQueryKey(), refetchInterval: 120000 }
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
    try {
      // סגירת המשחק בשרת (זה מה ששומר להיסטוריה)
      await closeSession.mutateAsync({ id: activeSession.id, data: { finalChips: finalChipsArray } });
      
      // איפוס זיכרון מקומי כדי שהשולחן יתנקה למשחק חדש
      queryClient.setQueryData(getGetActiveSessionQueryKey(), null);
      await queryClient.invalidateQueries({ queryKey: getGetActiveSessionQueryKey() });
      
      navigate(`/settlement/${activeSession.id}`);
    } catch (e) {
      console.error("Error closing session", e);
    }
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

  const totalPot = tablePlayers.reduce((s, p) => s + p.totalBuyins, 0);

  return (
    <Layout adminMode={adminMode} onAdminClick={() => !adminMode && setShowAdminLogin(true)}>
      <div className="flex flex-col min-h-full bg-white">
        {activeSession && (
          <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <div className="text-xs text-black">קופה: <span className="font-bold text-sm">{totalPot} ₪</span></div>
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
              <div className="border-[6px] border-black/5 shadow-2xl mx-auto flex items-center justify-center bg-red-700"
                   style={{ width: '100%', aspectRatio: '2/1', borderRadius: '150px' }}>
                <div className="text-center text-white font-black text-3xl italic">CHINO POKER</div>
              </div>
              {adminMode ? (
                <button onClick={handleStartSession} className="bg-black text-white font-black px-12 py-4 rounded-full shadow-xl">פתח שולחן חדש</button>
              ) : (
                <button onClick={() => setShowAdminLogin(true)} className="text-red-600 font-bold underline">הקש קוד מנהל להתחלת משחק</button>
              )}
            </div>
          ) : (
            <>
              <PokerTable players={tablePlayers} adminMode={adminMode} onSeatClick={handleSeatClick} />
              {adminMode && (
                <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-8">
                  <button onClick={() => setShowAddPlayer(true)} className="bg-red-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg">הוסף שחקן <Plus /></button>
                  <button onClick={() => setShowClose(true)} className="bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg">סגור משחק <DoorClosed /></button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AdminLoginModal open={showAdminLogin} onClose={() => setShowAdminLogin(false)} onLogin={login} />
      <AddPlayerModal open={showAddPlayer} onClose={() => setShowAddPlayer(false)} onAddPlayer={handleAddPlayer} />
      <BuyinModal open={showBuyin} onClose={() => { setShowBuyin(false); setSelectedPlayer(null); }} player={selectedPlayer} onBuyin={handleBuyin} />
      {activeSession && <CloseSessionModal open={showClose} onClose={() => setShowClose(false)} players={tablePlayers} onClose2={handleCloseSession} />}
    </Layout>
  );
}