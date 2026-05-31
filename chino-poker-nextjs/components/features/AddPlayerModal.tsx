"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSearchPlayers, getSearchPlayersQueryKey, useCreatePlayer } from "@workspace/api-client-react";
import { UserPlus, UserCheck, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { handleError } from "@/lib/error-handler";

interface AddPlayerModalProps {
  open: boolean;
  onClose: () => void;
  onAddPlayer: (playerId: number, initialBuyin: number) => Promise<void>;
}

/**
 * Component: Search result item for a player.
 */
function PlayerSearchResult({
  player,
  onSelect,
}: {
  player: any;
  onSelect: (p: any) => void;
}) {
  return (
    <button
      onClick={() => onSelect(player)}
      className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-red-300 hover:shadow-md transition-all group"
    >
      <UserCheck className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-colors" />
      <div className="text-end">
        <div className="text-gray-900 font-bold text-sm">
          {player.firstName} {player.lastName}
        </div>
        <div className="text-gray-400 text-[10px] font-medium">{player.phone}</div>
      </div>
    </button>
  );
}

/**
 * Component: Step for selecting initial buy-in amount.
 */
function BuyinSelection({
  player,
  onConfirm,
  onBack,
  isSubmitting,
}: {
  player: any;
  onConfirm: (amount: number) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [amount, setAmount] = useState(50);
  const options = [50, 100, 200, 300, 500];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-100 font-black text-red-600 text-xl">
          {player.firstName[0]}
          {player.lastName?.[0] || ""}
        </div>
        <h3 className="text-gray-900 font-black text-lg">
          {player.firstName} {player.lastName}
        </h3>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
          סכום כניסה התחלתי
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {options.map((val) => (
          <button
            key={val}
            onClick={() => setAmount(val)}
            className={`py-3 rounded-xl font-black text-sm transition-all ${
              amount === val ? "bg-red-600 text-white shadow-lg" : "bg-gray-50 text-gray-400 border border-gray-100"
            }`}
          >
            {val} ₪
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onConfirm(amount)}
          disabled={isSubmitting}
          className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "אשר והוסף שחקן"}
        </button>
        <button
          onClick={onBack}
          className="px-6 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all"
        >
          חזור
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Modal: Add Player to Session.
 * Search for existing players and add them to the current table.
 */
export function AddPlayerModal({ open, onClose, onAddPlayer }: AddPlayerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPlayer = useCreatePlayer();

  const { data: searchResults, isLoading } = useSearchPlayers(
    { q: search },
    { query: { queryKey: getSearchPlayersQueryKey({ q: search }), enabled: search.length >= 2, staleTime: 0 } }
  );

  const handleConfirm = async (amount: number) => {
    if (!selectedPlayer) return;
    setIsSubmitting(true);
    try {
      await onAddPlayer(selectedPlayer.id, amount);
      handleClose();
    } catch (e) {
      handleError(e, "נכשל בהוספת השחקן");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAddGuest = async () => {
    if (!search) return;
    setIsSubmitting(true);
    try {
      const guest = await createPlayer.mutateAsync({
        data: {
          firstName: search,
          lastName: "(אורח)",
          phone: "",
          isGuest: true,
        },
      });
      setSelectedPlayer(guest);
    } catch (e) {
      handleError(e, "נכשל ביצירת שחקן אורח");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSearch("");
    setSelectedPlayer(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm rounded-[32px] p-6 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center font-cinzel text-xl font-black tracking-[0.2em] uppercase italic">
            הוספת שחקן
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <AnimatePresence mode="wait">
            {!selectedPlayer ? (
              <motion.div
                key="search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="relative">
                  <input
                    autoFocus
                    placeholder="חפש לפי שם או טלפון..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pe-10 ps-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-100 transition-all text-end"
                  />
                  <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {isLoading ? (
                    <div className="py-10 text-center flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        מחפש...
                      </span>
                    </div>
                  ) : (
                    <>
                      {searchResults && searchResults.length > 0 ? (
                        searchResults.map((p) => (
                          <PlayerSearchResult key={p.id} player={p} onSelect={setSelectedPlayer} />
                        ))
                      ) : search.length >= 2 ? (
                        <div className="py-10 text-center text-gray-300">
                          <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-20" />
                          <div className="text-xs font-bold">לא נמצאו שחקנים</div>
                        </div>
                      ) : (
                        <div className="py-10 text-center text-gray-300 italic text-xs">
                          הקלד לפחות 2 תווים לחיפוש
                        </div>
                      )}

                      {search.length >= 2 && (
                        <button
                          onClick={handleQuickAddGuest}
                          disabled={isSubmitting}
                          className="w-full mt-4 flex items-center justify-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-bold text-sm hover:bg-red-100 transition-all"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                          הוסף את "{search}" כאורח
                        </button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <BuyinSelection
                player={selectedPlayer}
                isSubmitting={isSubmitting}
                onConfirm={handleConfirm}
                onBack={() => setSelectedPlayer(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
