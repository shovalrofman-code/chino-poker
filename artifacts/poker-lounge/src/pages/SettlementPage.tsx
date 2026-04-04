import { useParams, Link } from "wouter";
import { useGetSessionSettlement, getGetSessionSettlementQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { useAdmin } from "@/hooks/useAdmin";
import { ChevronRight, Phone, Share2, Check, Wallet } from "lucide-react";
import { useState } from "react";

function buildWhatsAppText(settlement: any): string {
  const date = new Date().toLocaleDateString("he-IL");
  const lines: string[] = [
    `🏁 *CHINO POKER - סיכום משחק* 🏁`,
    `📅 תאריך: ${date}`,
    `--------------------------------`,
    `💰 *קופה כוללת:* ${settlement.totalPot.toFixed(0)} ₪`,
    `🏦 *עמלת קבוצה:* ${settlement.totalRake.toFixed(0)} ₪`,
    `--------------------------------`,
    `📊 *תוצאות שחקנים (נטו):*`,
  ];

  settlement.players
    .slice()
    .sort((a: any, b: any) => b.netProfit - a.netProfit)
    .forEach((p: any) => {
      const sign = p.netProfit > 0 ? "+" : "";
      const icon = p.netProfit > 0 ? "✅" : p.netProfit < 0 ? "🔻" : "⚪";
      const phone = p.phone ? ` (${p.phone})` : "";
      lines.push(`${icon} ${p.firstName} ${p.lastName}${phone}: ${sign}${p.netProfit.toFixed(0)} ₪`);
    });

  lines.push(`--------------------------------`);
  lines.push(`💸 *מי מעביר למי:*`);

  if (settlement.transfers.length === 0) {
    lines.push(`✅ כולם מאוזנים - אין העברות!`);
  } else {
    settlement.transfers.forEach((t: any) => {
      const fromPhone = t.fromPhone ? ` (${t.fromPhone})` : "";
      const toPhone = t.toPhone ? ` (${t.toPhone})` : "";
      lines.push(`💳 ${t.fromName}${fromPhone} ⬅️ ${t.amount.toFixed(0)} ₪ ⬅️ ${t.toName}${toPhone}`);
    });
  }

  lines.push(`--------------------------------`);
  lines.push(`_הופק באמצעות CHINO POKER APP_`);
  return lines.join("\n");
}

export default function SettlementPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = parseInt(params.sessionId || "0");
  const { adminMode } = useAdmin();
  const [copied, setCopied] = useState(false);

  const { data: settlement } = useGetSessionSettlement(sessionId, {
    query: { queryKey: getGetSessionSettlementQueryKey(sessionId), enabled: !!sessionId }
  });

  const handleShare = async () => {
    if (!settlement) return;
    const text = buildWhatsAppText(settlement);
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch (e) { }
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!settlement) return <Layout adminMode={adminMode}><div className="p-20 text-center font-bold text-red-600">מחשב תוצאות...</div></Layout>;

  return (
    <Layout adminMode={adminMode}>
      <div className="p-4 max-w-xl mx-auto space-y-6 pb-12 bg-white">
        <Link href="/" className="flex items-center gap-1 text-gray-500 font-bold text-sm"><ChevronRight /> חזרה לשולחן</Link>

        <div className="bg-black text-white p-6 rounded-3xl shadow-xl flex justify-between items-center">
          <h1 className="text-2xl font-black italic">CHINO POKER</h1>
          <div className="text-2xl font-black">{settlement.totalPot.toFixed(0)} ₪</div>
        </div>

        <button onClick={handleShare} className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${copied ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {copied ? <Check /> : <Share2 />} {copied ? "הסיכום הועתק!" : "שלח סיכום לווטסאפ"}
        </button>

        <section className="space-y-3">
          <div className="text-xs font-black text-gray-400 text-right uppercase">מי מעביר למי</div>
          {settlement.transfers.map((t: any, i: number) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
              <div className="text-left"><div className="text-green-600 font-black text-sm">{t.toName}</div><div className="text-[10px] text-gray-400">{t.toPhone}</div></div>
              <div className="text-xl font-black">{t.amount.toFixed(0)} ₪</div>
              <div className="text-right"><div className="text-red-600 font-black text-sm">{t.fromName}</div><div className="text-[10px] text-gray-400">{t.fromPhone}</div></div>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <div className="text-xs font-black text-gray-400 text-right uppercase">תוצאות שחקנים</div>
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
            {settlement.players.slice().sort((a: any, b: any) => b.netProfit - a.netProfit).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                <div className={`font-black text-lg ${p.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>{p.netProfit > 0 ? "+" : ""}{p.netProfit.toFixed(0)} ₪</div>
                <div className="text-right"><div className="font-bold">{p.firstName} {p.lastName}</div><div className="text-[10px] text-gray-400">{p.phone}</div></div>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-6 text-center">
          <div className="text-red-600 font-black text-3xl">{settlement.totalRake.toFixed(0)} ₪</div>
          <div className="text-red-900 font-bold text-xs mt-1">סה"כ עמלת קבוצה (10% מהרווח)</div>
        </div>
      </div>
    </Layout>
  );
}