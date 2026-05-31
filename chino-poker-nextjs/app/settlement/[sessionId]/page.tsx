"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useGetSessionSettlement, getGetSessionSettlementQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { useAdmin } from "@/hooks/useAdmin";
import { ChevronRight, Phone, Share2, Check, Wallet, Info, ArrowRightLeft } from "lucide-react";
import { useState } from "react";

function buildWhatsAppText(settlement: any): string {
  const date = new Date().toLocaleDateString("he-IL");
  const lines: string[] = [
    `🏁 *CHINO POKER - סיכום משחק רשמי* 🏁`,
    `📅 תאריך: ${date}`,
    `--------------------------------`,
    `💰 *קופה כוללת:* ${settlement.totalPot.toFixed(0)} ₪`,
    `🏦 *עמלת קבוצה:* ${settlement.totalRake.toFixed(0)} ₪`,
    `*(העמלה נגבתה מהמנצחים בלבד - 10% מהרווח)*`,
    `--------------------------------`,
    `📊 *פירוט שחקנים (מי נגד מי):*`,
  ];

  settlement.players
    .slice()
    .sort((a: any, b: any) => b.netProfit - a.netProfit)
    .forEach((p: any) => {
      const icon = p.netProfit > 0 ? "✅" : p.netProfit < 0 ? "🔴" : "⚪";
      const status = p.netProfit > 0 ? "רווח נקי" : "הפסד";
      const phone = p.phone ? ` (${p.phone})` : "";
      
      lines.push(`${icon} *${p.firstName} ${p.lastName}*${phone}`);
      lines.push(`   ← כניסות: ${p.totalBuyins} ₪`);
      lines.push(`   ← יצא עם: ${p.finalChips} ₪`);
      if (p.rake > 0) lines.push(`   ← עמלה (10%): ${p.rake.toFixed(0)} ₪`);
      lines.push(`   ← *${status}: ${p.netProfit.toFixed(0)} ₪*`);
      lines.push(``);
    });

  lines.push(`--------------------------------`);
  lines.push(`💸 *מי מעביר למי (סגירת חשבון):*`);

  if (settlement.transfers.length === 0) {
    lines.push(`✅ כולם מאוזנים - אין העברות!`);
  } else {
    settlement.transfers.forEach((t: any) => {
      const fromPhone = t.fromPhone ? ` (${t.fromPhone})` : "";
      const toPhone = t.toPhone ? ` (${t.toPhone})` : "";
      lines.push(`💳 *${t.fromName}*${fromPhone}\n   מעביר *${t.amount.toFixed(0)} ₪*\n   אל *${t.toName}*${toPhone}`);
      lines.push(``);
    });
  }

  lines.push(`--------------------------------`);
  lines.push(`_הופק באמצעות אפליקציית CHINO POKER_`);
  return lines.join("\n");
}

export default function SettlementPage() {
  const params = useParams();
  const sessionId = parseInt(params?.sessionId as string || "0");
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

  if (!settlement) return <Layout adminMode={adminMode}><div className="p-20 text-center font-bold text-red-600">מחשב נתונים סופיים...</div></Layout>;

  return (
    <Layout adminMode={adminMode}>
      <div className="p-4 max-w-xl mx-auto space-y-6 pb-12 bg-white min-h-full">
        
        <Link href="/" className="flex items-center gap-1 text-gray-500 font-bold text-sm">
          <ChevronRight className="w-5 h-5" /> חזרה לשולחן
        </Link>

        {/* כותרת יוקרתית */}
        <div className="bg-black text-white p-6 rounded-3xl shadow-xl border-b-4 border-red-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black italic">CHINO POKER</h1>
              <p className="text-red-500 font-bold text-xs uppercase tracking-widest">Final Settlement Report</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">קופה</div>
              <div className="text-2xl font-black">{settlement.totalPot.toFixed(0)} ₪</div>
            </div>
          </div>
        </div>

        {/* הסבר על הרייק */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed text-right">
            החישוב בוצע לפי 10% עמלה מהרווח הנקי של המנצחים בלבד. 
            סך העמלה שנאספה למארח: <strong>{settlement.totalRake.toFixed(0)} ₪</strong>.
          </p>
        </div>

        {/* סקציית העברות כספים */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
             <ArrowRightLeft className="w-4 h-4 text-gray-400" />
             <h2 className="text-sm font-black text-gray-900 uppercase">מי מעביר למי</h2>
          </div>
          <div className="space-y-3">
            {settlement.transfers.map((t: any, i: number) => (
              <div key={i} className="bg-white border-2 border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="text-left w-1/3">
                  <div className="text-green-600 font-black text-sm truncate">{t.toName}</div>
                  <div className="text-[10px] text-gray-400 font-bold">{t.toPhone}</div>
                </div>
                <div className="flex flex-col items-center w-1/3">
                  <div className="text-xl font-black text-black">{t.amount.toFixed(0)} ₪</div>
                  <div className="text-[9px] text-gray-400 font-bold">מעביר בקבוצה</div>
                </div>
                <div className="text-right w-1/3">
                  <div className="text-red-600 font-black text-sm truncate">{t.fromName}</div>
                  <div className="text-[10px] text-gray-400 font-bold">{t.fromPhone}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* כפתור שיתוף בולט */}
        <button onClick={handleShare} className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${copied ? "bg-green-600 text-white" : "bg-red-600 text-white active:scale-95"}`}>
          {copied ? <Check className="w-6 h-6" /> : <Share2 className="w-6 h-6" />}
          {copied ? "הסיכום הועתק להדבקה!" : "שתף סיכום מפורט לוואטסאפ"}
        </button>

        {/* דוח מפורט לכל שחקן */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-gray-900 uppercase text-right px-1">פירוט חשבונות מלא</h2>
          <div className="grid gap-3">
            {settlement.players.slice().sort((a: any, b: any) => b.netProfit - a.netProfit).map((p: any, i: number) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <div className="flex justify-between items-start mb-3 border-b border-gray-200 pb-2">
                   <div className={`text-lg font-black ${p.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                     {p.netProfit > 0 ? "+" : ""}{p.netProfit.toFixed(0)} ₪
                   </div>
                   <div className="text-right">
                     <div className="font-black text-black">{p.firstName} {p.lastName}</div>
                     <div className="text-[10px] text-gray-400 font-bold">{p.phone || "אין טלפון"}</div>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-[11px] font-bold text-gray-500">
                   <div className="text-left">כניסות:</div>
                   <div className="text-right text-black">{p.totalBuyins} ₪</div>
                   <div className="text-left">אסימונים בסוף:</div>
                   <div className="text-right text-black">{p.finalChips} ₪</div>
                   {p.rake > 0 && (
                     <>
                       <div className="text-left text-red-500">עמלה (10% מהרווח):</div>
                       <div className="text-right text-red-500">-{p.rake.toFixed(0)} ₪</div>
                     </>
                   )}
                   <div className="text-left border-t border-gray-200 pt-1 mt-1 font-black">רווח נקי סופי:</div>
                   <div className={`text-right border-t border-gray-200 pt-1 mt-1 font-black ${p.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                     {p.netProfit.toFixed(0)} ₪
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* קופת המארח */}
        <div className="bg-black rounded-3xl p-6 text-center shadow-inner">
          <Wallet className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-white font-black text-4xl">{settlement.totalRake.toFixed(0)} ₪</div>
          <div className="text-red-500 font-bold text-xs mt-1 uppercase tracking-tighter">סך עמלת קבוצה שנאספה</div>
        </div>

      </div>
    </Layout>
  );
}
