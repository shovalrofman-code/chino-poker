"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useGetSessionSettlement, getGetSessionSettlementQueryKey } from "@/lib/api-hooks";
import { Layout } from "@/components/Layout";
import { useAdmin } from "@/hooks/useAdmin";
import { ChevronRight, Share2, Check, Wallet, Info, ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { FintechCard } from "@/components/ui/FintechCard";
import { handleError } from "@/lib/error-handler";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      try { await navigator.share({ text }); return; } catch (e) {
        handleError(e, "נכשל בשיתוף");
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      handleError(e, "נכשל בהעתקה");
    }
  };

  if (!settlement) return (
    <Layout adminMode={adminMode}>
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <div className="font-black text-gray-900 uppercase tracking-widest text-sm">מחשב סיכום משחק...</div>
      </div>
    </Layout>
  );

  return (
    <Layout adminMode={adminMode}>
      <div className="p-4 max-w-xl mx-auto space-y-6 pb-12 bg-white min-h-full">
        
        <Link href="/" className="flex items-center gap-1 text-gray-400 hover:text-red-600 transition-colors font-bold text-sm">
          <ChevronRight className="w-5 h-5" /> חזרה לשולחן
        </Link>

        {/* Branded Header */}
        <div className="bg-black text-white p-6 rounded-3xl shadow-xl border-b-4 border-red-600 relative overflow-hidden">
          <div className="absolute top-0 end-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -me-16 -mt-16" />
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-cinzel font-black italic tracking-wider">CHINO POKER</h1>
              <p className="text-red-500 font-black text-[10px] uppercase tracking-[0.2em]">דוח סיכום משחק סופי</p>
            </div>
            <div className="text-end">
              <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">קופה כוללת</div>
              <div className="text-2xl font-black">{settlement.totalPot.toFixed(0)} ₪</div>
            </div>
          </div>
        </div>

        {/* Rake Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed text-end font-medium">
            החישוב בוצע לפי 10% עמלה מהרווח הנקי של המנצחים בלבד. 
            סך העמלה שנאספה למארח: <strong>{settlement.totalRake.toFixed(0)} ₪</strong>.
          </p>
        </div>

        {/* Money Transfers */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
             <ArrowRightLeft className="w-4 h-4 text-gray-400" />
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">מי מעביר למי</h2>
          </div>
          <div className="space-y-2">
            {settlement.transfers.map((t: any, i: number) => (
              <FintechCard key={i} hoverable={false} className="flex items-center justify-between border-gray-100 bg-white shadow-sm">
                <div className="text-start w-1/3">
                  <div className="text-green-600 font-black text-sm truncate">{t.toName}</div>
                  <div className="text-[9px] text-gray-400 font-bold">{t.toPhone}</div>
                </div>
                <div className="flex flex-col items-center w-1/3">
                  <div className="text-lg font-black text-gray-900">{t.amount.toFixed(0)} ₪</div>
                  <div className="w-8 h-px bg-gray-100 my-1" />
                  <div className="text-[8px] text-gray-300 font-black uppercase tracking-tighter">העברה</div>
                </div>
                <div className="text-end w-1/3">
                  <div className="text-red-600 font-black text-sm truncate">{t.fromName}</div>
                  <div className="text-[9px] text-gray-400 font-bold">{t.fromPhone}</div>
                </div>
              </FintechCard>
            ))}
            {settlement.transfers.length === 0 && (
              <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">אין העברות לביצוע</p>
              </div>
            )}
          </div>
        </section>

        {/* WhatsApp Share Button */}
        <button onClick={handleShare} className="casino-btn w-full py-5 text-base justify-center shadow-red-200 active:scale-95 transition-all">
          {copied ? <Check className="w-6 h-6" /> : <Share2 className="w-6 h-6" />}
          {copied ? "הסיכום הועתק!" : "שתף סיכום לוואטסאפ"}
        </button>

        {/* Full Breakdown Accordion */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
             <Info className="w-4 h-4 text-gray-400" />
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">פירוט חשבונות מלא</h2>
          </div>
          
          <Accordion type="single" collapsible className="space-y-2 border-none">
            {settlement.players.slice().sort((a: any, b: any) => b.netProfit - a.netProfit).map((p: any, i: number) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-none">
                <FintechCard hoverable={false} className="p-0 overflow-hidden border-gray-100">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline">
                    <div className="flex justify-between items-center w-full ms-4">
                       <div className={`text-sm font-black ${p.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                         {p.netProfit > 0 ? "+" : ""}{p.netProfit.toFixed(0)} ₪
                       </div>
                       <div className="text-end">
                         <div className="font-bold text-gray-900 text-sm">{p.firstName} {p.lastName}</div>
                         <div className="text-[9px] text-gray-400 font-bold">{p.phone || "אין טלפון"}</div>
                       </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="grid grid-cols-2 gap-y-2 text-[11px] font-bold text-gray-500 pt-2 border-t border-gray-50">
                       <div className="text-start font-medium">כניסות:</div>
                       <div className="text-end text-gray-900">{p.totalBuyins} ₪</div>
                       <div className="text-start font-medium">אסימונים בסוף:</div>
                       <div className="text-end text-gray-900">{p.finalChips} ₪</div>
                       {p.rake > 0 && (
                         <>
                           <div className="text-start text-red-500 font-medium">עמלה (10%):</div>
                           <div className="text-end text-red-500">-{p.rake.toFixed(0)} ₪</div>
                         </>
                       )}
                       <div className="text-start border-t border-gray-100 pt-2 mt-1 font-black text-gray-900">רווח נקי סופי:</div>
                       <div className={`text-end border-t border-gray-100 pt-2 mt-1 font-black ${p.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                         {p.netProfit.toFixed(0)} ₪
                       </div>
                    </div>
                  </AccordionContent>
                </FintechCard>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Group Treasury Card */}
        <div className="bg-black rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 start-0 w-full h-1 bg-red-600" />
          <Wallet className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <div className="text-white font-cinzel font-black text-5xl tracking-tighter">{settlement.totalRake.toFixed(0)} ₪</div>
          <div className="text-red-500 font-black text-[10px] mt-2 uppercase tracking-[0.3em]">סך עמלת קבוצה שנאספה</div>
        </div>

      </div>
    </Layout>
  );
}
