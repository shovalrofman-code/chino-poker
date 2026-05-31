"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Coins, Plus, Loader2, Undo2, X } from "lucide-react";
import { handleError } from "@/lib/error-handler";

interface Buyin {
  id: number;
  amount: number;
  createdAt: string;
}

interface BuyinModalProps {
  open: boolean;
  onClose: () => void;
  player: {
    playerId: number;
    firstName: string;
    lastName: string;
    totalBuyins: number;
    buyins?: Buyin[];
  } | null;
  onBuyin: (playerId: number, amount: number) => Promise<void>;
  onUndoBuyin?: (buyinId: number) => Promise<void>;
}

/**
 * Modal: Add Buy-in.
 * Allows adding more chips to an existing player's balance during a session.
 * Now includes "Undo" functionality for accidental entries.
 */
export function BuyinModal({ open, onClose, player, onBuyin, onUndoBuyin }: BuyinModalProps) {
  const [amount, setAmount] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [undoingId, setUndoingId] = useState<number | null>(null);
  
  const options = [50, 100, 200, 300, 500];

  const handleConfirm = async () => {
    if (!player) return;
    setIsSubmitting(true);
    try {
      await onBuyin(player.playerId, amount);
      onClose();
    } catch (e) {
      handleError(e, "נכשל ברישום הכניסה");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUndo = async (buyinId: number) => {
    if (!onUndoBuyin) return;
    setUndoingId(buyinId);
    try {
      await onUndoBuyin(buyinId);
    } catch (e) {
      handleError(e, "נכשל בביטול הכניסה");
    } finally {
      setUndoingId(null);
    }
  };

  if (!player) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-[32px] p-6 border-none shadow-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center font-cinzel text-xl font-black tracking-[0.2em] uppercase italic text-gray-900">
            כניסה לשחקן
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Header Info */}
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-red-100 shadow-inner">
              <Coins className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-gray-900 font-black text-xl tracking-tight">
              {player.firstName} {player.lastName}
            </h3>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">מאזן נוכחי</span>
              <span className="text-sm font-black text-red-600 px-2 py-0.5 bg-red-50 rounded-lg">{player.totalBuyins} ₪</span>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {options.map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                className={`py-4 rounded-xl font-black text-sm transition-all active:scale-95 ${
                  amount === val ? "bg-red-600 text-white shadow-lg shadow-red-200" : "bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100"
                }`}
              >
                {val} ₪
              </button>
            ))}
          </div>

          {/* Main Action */}
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                אשר כניסה נוספת
              </>
            )}
          </button>

          {/* Undo History Section */}
          {player.buyins && player.buyins.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">היסטוריה (ביטול כניסה)</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                {player.buyins.map((b) => (
                  <div key={b.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                     <button
                      onClick={() => handleUndo(b.id)}
                      disabled={undoingId !== null}
                      className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-all"
                      title="בטל כניסה"
                    >
                      {undoingId === b.id ? <Loader2 size={14} className="animate-spin" /> : <Undo2 size={14} />}
                    </button>
                    <div className="text-end">
                      <span className="text-gray-900 font-bold text-xs">{b.amount} ₪</span>
                      <span className="text-[9px] text-gray-400 font-medium ms-2">
                        {new Date(b.createdAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
