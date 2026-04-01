import { Link } from "wouter";
import { useListSessions, getListSessionsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { useState } from "react";
import { Clock, CheckCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const { adminMode, login } = useAdmin();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const { data: sessions } = useListSessions({ query: { queryKey: getListSessionsQueryKey() } });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IL", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const formatDuration = (start: string, end: string | null | undefined) => {
    if (!end) return "In progress";
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  return (
    <Layout adminMode={adminMode} onAdminClick={() => !adminMode && setShowAdminLogin(true)}>
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <div className="pt-2">
          <h1 className="font-cinzel text-[#D4AF37] text-xl font-bold tracking-widest">SESSION HISTORY</h1>
          <p className="text-gray-500 text-xs mt-1">{sessions?.length || 0} sessions total</p>
        </div>

        <div className="space-y-3">
          {sessions?.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={session.status === "closed" ? `/settlement/${session.id}` : "/"}
                className="block bg-[#111] border border-[#222] hover:border-[#D4AF37]/30 rounded-xl p-4 transition-all"
                data-testid={`session-card-${session.id}`}
              >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {session.status === "active" ? (
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="text-white font-semibold text-sm">
                          {session.status === "active" ? "Active Session" : `Session #${session.id}`}
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(session.startedAt)}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        {session.status === "closed" && (
                          <div className="text-[#D4AF37] text-sm font-bold">
                            {parseFloat(String(session.totalRake || 0)).toFixed(0)} ₪ rake
                          </div>
                        )}
                        <div className="text-gray-600 text-xs">
                          {formatDuration(session.startedAt, session.closedAt)}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {(!sessions || sessions.length === 0) && (
          <div className="text-center py-16 text-gray-600">
            <div className="font-cinzel text-2xl mb-2">No sessions yet</div>
            <div className="text-sm">Start a session from the main table</div>
          </div>
        )}
      </div>

      <AdminLoginModal open={showAdminLogin} onClose={() => setShowAdminLogin(false)} onLogin={login} />
    </Layout>
  );
}
