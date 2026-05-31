"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock, Unlock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (password: string) => boolean;
}

/**
 * Modal: Admin Login.
 * Simple password-based entry for administrative functions.
 */
export function AdminLoginModal({ open, onClose, onLogin }: AdminLoginModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (success) {
      setPassword("");
      setError(false);
      onClose();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-[32px] p-8 border-none shadow-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center font-cinzel text-2xl font-black tracking-widest uppercase italic">
            כניסת מנהל
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-600/5 blur-2xl rounded-full" />
            <div className="relative flex flex-col items-center gap-4">
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all duration-500 ${
                  error ? "bg-red-50 border-red-200 animate-shake" : "bg-gray-50 border-gray-100"
                }`}
              >
                {error ? (
                  <AlertCircle className="w-10 h-10 text-red-500" />
                ) : (
                  <Lock className="w-10 h-10 text-gray-300" />
                )}
              </div>

              <input
                type="password"
                autoFocus
                placeholder="הקש קוד מנהל..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-gray-50 border rounded-2xl px-4 py-4 text-center text-xl font-black tracking-widest focus:outline-none transition-all ${
                  error ? "border-red-300 ring-4 ring-red-50" : "border-gray-100 focus:ring-4 focus:ring-red-50"
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-gray-900 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
          >
            <Unlock className="w-5 h-5" />
            כניסה למערכת
          </button>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-red-500 text-xs font-bold uppercase tracking-widest"
              >
                קוד שגוי, נסה שנית
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </DialogContent>
    </Dialog>
  );
}
