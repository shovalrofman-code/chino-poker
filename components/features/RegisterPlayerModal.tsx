"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreatePlayer } from "@/lib/api-hooks";
import { UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { handleError } from "@/lib/error-handler";

interface RegisterPlayerModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal: Register New Player.
 * Form to add a new permanent player to the system.
 */
export function RegisterPlayerModal({ open, onClose }: RegisterPlayerModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    isGuest: false,
  });
  const [success, setSuccess] = useState(false);

  const createPlayer = useCreatePlayer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName) return;

    try {
      await createPlayer.mutateAsync({
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          isGuest: formData.isGuest,
        },
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ firstName: "", lastName: "", phone: "", isGuest: false });
        onClose();
      }, 1500);
    } catch (e) {
      handleError(e, "נכשל ברישום השחקן");
    }
  };

  const handleClose = () => {
    if (!createPlayer.isPending) {
      setFormData({ firstName: "", lastName: "", phone: "", isGuest: false });
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm rounded-[32px] p-8 border-none shadow-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center font-cinzel text-xl font-black tracking-widest uppercase italic">
            שחקן חדש
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center space-y-4"
            >
              <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto border border-green-100 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <div className="text-gray-900 font-black text-lg">שחקן נרשם בהצלחה!</div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest me-1">
                    שם פרטי *
                  </label>
                  <input
                    required
                    placeholder="שם פרטי"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-4 focus:ring-red-50 focus:outline-none transition-all text-end"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest me-1">
                    שם משפחה
                  </label>
                  <input
                    placeholder="שם משפחה"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-4 focus:ring-red-50 focus:outline-none transition-all text-end"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest me-1">
                    מספר טלפון
                  </label>
                  <input
                    type="tel"
                    placeholder="טלפון"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-4 focus:ring-red-50 focus:outline-none transition-all text-end"
                  />
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="text-end">
                    <div className="text-sm font-bold text-gray-900">שחקן אורח</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">חד פעמי / ללא טלפון</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isGuest}
                    onChange={(e) => setFormData({ ...formData, isGuest: e.target.checked })}
                    className="w-5 h-5 accent-red-600 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createPlayer.isPending}
                className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter disabled:opacity-50"
              >
                {createPlayer.isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    צור שחקן חדש
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
