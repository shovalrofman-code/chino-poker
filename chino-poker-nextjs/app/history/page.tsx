"use client";

import Link from "next/link";
import { useState } from "react";
import { useListSessions, getListSessionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { Clock, CheckCircle, ChevronLeft, Trash2, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function deleteSession(id: number) {
  return fetch(`/api/sessions/${id}`, { method: "DELETE" }).then(async r => {
    if (!r.ok) throw new Error("שגיאה במחיקה");
    return r.json();
  });
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDuration(start?: string | null, end?: string | null) {
  if (!start) return "";
  const mins = Math.floor((new Date(end || Date.now()).getTime() - new Date(start).getTime()) / 60000);
  if (mins < 60) return `${mins} דק'`;
  return `${Math.floor(mins / 60)}ש ${mins % 60}ד`;
}

function ConfirmDeleteModal({ sessionId, onConfirm, onCancel, isDeleting }: {
  sessionId: number | null; onConfirm: () => void; onCancel: () => void; isDeleting: boolean;
}) {
  if (!sessionId) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onCancel}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl max-w-xs w-full"
        >
          <button onClick={onCancel} className="absolute top-4 left-4 text-gray-300 hover:text-gray-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-gray-900 font-bold text-base">מחיקת משחק #{sessionId}</div>
              <div className="text-gray-400 text-sm mt-1">
                פעולה זו תמחק לצמיתות את המשחק, כל הכניסות ורשומות השחקנים. לא ניתן לבטל פעולה זו.
              </div>
            </div>
            <div className="flex gap-2 w-full">
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                data-testid="button-confirm-delete"
              >
                {isDeleting ? <span className="animate-pulse">מוחק...</span> : <><Trash2 className="w-3.5 h-3.5" />אישור מחיקה</>}
              </button>
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                ביטול
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function HistoryPage() {
  const { adminMode, login } = useAdmin();
  const queryClient = useQueryClient();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const { data: sessions } = useListSessions({ query: { queryKey: getListSessionsQueryKey() } });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
      setPendingDelete(null);
    },
  });

  return (
    <Layout adminMode={adminMode} onAdminClick={() => !adminMode && setShowAdminLogin(true)}>
      <div className="p-4 max-w-xl mx-auto space-y-4 pb-8">
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {adminMode && (
              <span className="text-[10px] text-gray-400 tracking-wider font-semibold bg-gray-100 px-2 py-1 rounded-lg">
                🗑 לחץ למחיקה
              </span>
            )}
          </div>
          <div className="text-right">
            <h1 className="font-cinzel text-gray-900 text-xl font-bold tracking-widest">היסטוריה</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {sessions?.filter(s => s.status === "closed").length || 0} משחקים שהסתיימו
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {sessions?.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.03 }}
              layout
            >
              <div className="flex items-center gap-2">
                {/* Admin trash button */}
                {adminMode && session.status === "closed" && (
                  <button
                    onClick={e => { e.preventDefault(); setPendingDelete(session.id); }}
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-300 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    data-testid={`button-delete-session-${session.id}`}
                    title="מחק משחק"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* Session card */}
                <Link
                  href={session.status === "closed" ? `/settlement/${session.id}` : "/"}
                  className="flex-1 flex items-center justify-between bg-white border border-gray-200 hover:border-red-300 hover:shadow-sm rounded-2xl p-4 transition-all"
                  data-testid={`session-card-${session.id}`}
                >
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {session.status === "closed" && (
                      <div className="text-left">
                        <div className="text-red-600 text-sm font-bold">
                          {parseFloat(String(session.totalRake || 0)).toFixed(0)} ₪
                        </div>
                        <div className="text-gray-400 text-[10px]">עמלה</div>
                      </div>
                    )}
                    <ChevronLeft className="w-4 h-4 text-gray-300" />
                  </div>

                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0 text-right">
                      <div className="text-gray-900 font-semibold text-sm">
                        {session.status === "active" ? "🟢 משחק פעיל" : `משחק #${session.id}`}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-0.5 justify-end">
                        <span>{formatDuration(session.startedAt, session.closedAt)}</span>
                        <span className="text-gray-200">·</span>
                        <span>{formatDate(session.startedAt)}</span>
                        <Clock className="w-3 h-3 flex-shrink-0" />
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      session.status === "active" ? "bg-green-50 border border-green-200" : "bg-gray-100 border border-gray-200"
                    }`}>
                      {session.status === "active"
                        ? <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                        : <CheckCircle className="w-4 h-4 text-gray-400" />
                      }
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {(!sessions || sessions.length === 0) && (
          <div className="text-center py-16">
            <Clock className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <div className="font-cinzel text-gray-300 text-xl mb-1">אין משחקים עדיין</div>
            <div className="text-gray-400 text-sm">התחל משחק לצפייה בהיסטוריה</div>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        sessionId={pendingDelete}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
        isDeleting={deleteMutation.isPending}
      />
      <AdminLoginModal open={showAdminLogin} onClose={() => setShowAdminLogin(false)} onLogin={login} />
    </Layout>
  );
}
