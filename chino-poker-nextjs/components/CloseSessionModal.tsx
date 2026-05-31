"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DoorClosed, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CloseSessionModalProps {
  open: boolean;
  onClose: () => void;
  players: any[];
  onClose2: (finalChips: Array<{ playerId: number; chips: number }>) => Promise<void>;
}

/**
 * Modal: Close Session.
 * Collects final chip counts for all players and validates the total table balance.
 */
export function CloseSessionModal({ open, onClose, players, onClose2 }: CloseSessionModalProps) {
  const [chips, setChips] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Constants
  const CHIPS_RATIO = 2; // 1 NIS = 2 Chips
  const totalBuyins = players.reduce((sum, p) => sum + p.totalBuyins, 0);
  const expectedTotalChips = totalBuyins * CHIPS_RATIO;
  
  const currentTotalChips = Object.values(chips).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );
  
  const diff = currentTotalChips - expectedTotalChips;
  const isBalanced = Math.abs(diff) < 0.1;

  const handleChipChange = (playerId: number, val: string) => {
    setChips((prev) => ({ ...prev, [playerId]: val }));
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const finalChipsArray = players.map((p) => ({
        playerId: p.playerId,
        chips: parseFloat(chips[p.playerId]) || 0,
      }));
      await onClose2(finalChipsArray);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[32px] p-6 border-none shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center font-cinzel text-xl font-black tracking-widest uppercase italic">
            End Session
          </DialogTitle>
        </DialogHeader>

        {/* Balance Status */}
        <div className={`mt-4 p-4 rounded-2xl border flex items-center justify-between transition-colors ${
          isBalanced ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
        }`}>
           <div className="text-right">
             <div className={`text-sm font-black ${isBalanced ? "text-green-700" : "text-red-700"}`}>
               {isBalanced ? "השולחן מאוזן" : `חוסר של ${Math.abs(diff).toFixed(0)} אסימונים`}
             </div>
             <div className="text-[10px] text-gray-500 font-bold">
               צפוי: {expectedTotalChips} | קיים: {currentTotalChips.toFixed(0)}
             </div>
           </div>
           {isBalanced ? <CheckCircle2 className="text-green-500 w-6 h-6" /> : <AlertCircle className="text-red-500 w-6 h-6 animate-pulse" />}
        </div>

        {/* Players List */}
        <div className="flex-1 overflow-y-auto mt-6 space-y-3 px-1 custom-scrollbar">
          {players.map((p) => (
            <div key={p.playerId} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="w-24">
                <input
                  type="number"
                  placeholder="0"
                  value={chips[p.playerId] || ""}
                  onChange={(e) => handleChipChange(p.playerId, e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-center font-black text-sm focus:ring-2 focus:ring-red-100 focus:outline-none"
                />
              </div>
              <div className="text-right">
                <div className="text-gray-900 font-bold text-sm">{p.firstName} {p.lastName}</div>
                <div className="text-[10px] text-gray-400 font-bold">כניסות: {p.totalBuyins} ₪</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="pt-6 mt-2 border-t border-gray-100">
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || (!isBalanced && process.env.NODE_ENV === "production")}
            className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter ${
              isBalanced ? "bg-black text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <DoorClosed className="w-5 h-5" />
                סגור משחק וחשב רווחים
              </>
            )}
          </button>
          {!isBalanced && (
            <p className="text-center text-[10px] text-red-500 font-bold mt-3 uppercase tracking-widest animate-bounce">
              חובה לאזן את השולחן לפני הסגירה
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
