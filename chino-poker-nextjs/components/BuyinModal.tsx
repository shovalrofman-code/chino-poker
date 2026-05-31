"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Coins, Plus, Loader2 } from "lucide-react";

interface BuyinModalProps {
  open: boolean;
  onClose: () => void;
  player: {
    playerId: number;
    firstName: string;
    lastName: string;
    totalBuyins: number;
  } | null;
  onBuyin: (playerId: number, amount: number) => Promise<void>;
}

/**
 * Modal: Add Buy-in.
 * Allows adding more chips to an existing player's balance during a session.
 */
export function BuyinModal({ open, onClose, player, onBuyin }: BuyinModalProps) {
  const [amount, setAmount] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const options = [50, 100, 200, 300, 500];

  const handleConfirm = async () => {
    if (!player) return;
    setIsSubmitting(true);
    try {
      await onBuyin(player.playerId, amount);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!player) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-[32px] p-6 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center font-cinzel text-xl font-black tracking-widest uppercase italic">
            Add Buy-In
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-red-100 shadow-inner">
              <Coins className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-gray-900 font-black text-xl">
              {player.firstName} {player.lastName}
            </h3>
            <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
              מאזן נוכחי: <span className="text-black underline">{player.totalBuyins} ₪</span>
            </div>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
