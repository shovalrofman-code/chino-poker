import { useParams } from "wouter";
import { Link } from "wouter";
import { useGetSessionSettlement, getGetSessionSettlementQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { useAdmin } from "@/hooks/useAdmin";
import { ChevronLeft, ArrowRight, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function SettlementPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = parseInt(params.sessionId || "0");
  const { adminMode } = useAdmin();

  const { data: settlement } = useGetSessionSettlement(sessionId, {
    query: { queryKey: getGetSessionSettlementQueryKey(sessionId), enabled: !!sessionId }
  });

  if (!settlement) {
    return (
      <Layout adminMode={adminMode}>
        <div className="flex items-center justify-center py-20 text-gray-500">Loading settlement...</div>
      </Layout>
    );
  }

  return (
    <Layout adminMode={adminMode}>
      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <Link href="/history" className="flex items-center gap-1 text-gray-500 hover:text-white text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" />
          History
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-cinzel text-[#D4AF37] text-xl font-bold tracking-widest">SETTLEMENT</h1>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span>Pot: <span className="text-white font-bold">{settlement.totalPot.toFixed(0)} ₪</span></span>
            <span>Rake: <span className="text-[#D4AF37] font-bold">{settlement.totalRake.toFixed(2)} ₪</span></span>
          </div>
        </motion.div>

        {/* Who pays whom */}
        {settlement.transfers.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <div className="text-gray-400 text-xs tracking-widest font-bold">WHO PAYS WHOM</div>
            {settlement.transfers.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.1 }}
                className="bg-[#111] border border-[#222] rounded-xl p-4"
                data-testid={`transfer-${i}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-left">
                    <div className="text-red-400 font-bold text-sm">{t.fromName}</div>
                    {t.fromPhone && (
                      <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                        <Phone className="w-3 h-3" />
                        {t.fromPhone}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-[#D4AF37] font-black text-lg">{t.amount.toFixed(0)} ₪</div>
                    <ArrowRight className="w-5 h-5 text-gray-600 mt-0.5" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-green-400 font-bold text-sm">{t.toName}</div>
                    {t.toPhone && (
                      <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5 justify-end">
                        <Phone className="w-3 h-3" />
                        {t.toPhone}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-6 text-gray-600 bg-[#111] border border-[#222] rounded-xl">
            All square — no transfers needed
          </div>
        )}

        {/* Player results */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <div className="text-gray-400 text-xs tracking-widest font-bold">PLAYER RESULTS</div>
          {settlement.players.map((player, i) => (
            <motion.div
              key={player.playerId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 + 0.2 }}
              className="bg-[#111] border border-[#222] rounded-xl p-4"
              data-testid={`result-player-${player.playerId}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white font-semibold">{player.firstName} {player.lastName}</div>
                  {player.phone && (
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                      <Phone className="w-3 h-3" />
                      {player.phone}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className={`font-black text-lg ${player.netProfit > 0 ? "text-green-400" : player.netProfit < 0 ? "text-red-400" : "text-gray-400"}`}>
                    {player.netProfit > 0 ? "+" : ""}{player.netProfit.toFixed(0)} ₪
                  </div>
                  {player.rake > 0 && (
                    <div className="text-[10px] text-gray-600 mt-0.5">
                      Rake: {player.rake.toFixed(2)} ₪
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-gray-600">
                <span>Buyins: {player.totalBuyins.toFixed(0)} ₪</span>
                <span>Final chips: {player.finalChips}</span>
                <span>Gross: {player.profit > 0 ? "+" : ""}{player.profit.toFixed(0)} ₪</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Rake info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#0d0d0d] border border-[#D4AF37]/20 rounded-xl p-4 text-center"
        >
          <div className="text-[#D4AF37] font-cinzel font-bold tracking-widest text-sm">GROUP RAKE</div>
          <div className="text-[#D4AF37] text-3xl font-black mt-1">{settlement.totalRake.toFixed(2)} ₪</div>
          <div className="text-gray-600 text-xs mt-1">10% of net profits — added to group balance</div>
        </motion.div>
      </div>
    </Layout>
  );
}
