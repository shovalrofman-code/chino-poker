import { Link } from "wouter";
import { useListSessions, getListSessionsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { useAdmin } from "@/hooks/useAdmin";
import { Clock, CheckCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function formatDuration(start?: string | null, end?: string | null) {
  if (!start) return "";
  const from = new Date(start).getTime();
  const to = end ? new Date(end).getTime() : Date.now();
  const mins = Math.floor((to - from) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function HistoryPage() {
  const { adminMode } = useAdmin();
  const { data: sessions } = useListSessions({ query: { queryKey: getListSessionsQueryKey() } });

  return (
    <Layout adminMode={adminMode}>
      <div className="p-4 max-w-xl mx-auto space-y-4 pb-8">
        <div className="pt-2">
          <h1 className="font-cinzel text-gray-900 text-xl font-bold tracking-widest">HISTORY</h1>
          <p className="text-gray-400 text-xs mt-0.5">{sessions?.length || 0} sessions</p>
        </div>

        <div className="space-y-2">
          {sessions?.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={session.status === "closed" ? `/settlement/${session.id}` : "/"}
                className="flex items-center justify-between bg-white border border-gray-200 hover:border-red-300 hover:shadow-sm rounded-2xl p-4 transition-all"
                data-testid={`session-card-${session.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${session.status === "active" ? "bg-green-50 border border-green-200" : "bg-gray-100 border border-gray-200"}`}>
                    {session.status === "active" ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold text-sm">
                      {session.status === "active" ? "Active Session" : `Session #${session.id}`}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatDate(session.startedAt)}
                      <span className="text-gray-300">·</span>
                      {formatDuration(session.startedAt, session.closedAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {session.status === "closed" && (
                    <div className="text-right">
                      <div className="text-red-600 text-sm font-bold">{parseFloat(String(session.totalRake || 0)).toFixed(0)} ₪</div>
                      <div className="text-gray-400 text-xs">rake</div>
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {(!sessions || sessions.length === 0) && (
          <div className="text-center py-16">
            <Clock className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <div className="font-cinzel text-gray-300 text-xl mb-1">No sessions yet</div>
            <div className="text-gray-400 text-sm">Start a game to see history here</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
