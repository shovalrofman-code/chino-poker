import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins } from "lucide-react";

interface BuyinModalProps {
  open: boolean;
  onClose: () => void;
  player: { playerId: number; firstName: string; lastName: string; totalBuyins: number } | null;
  onBuyin: (playerId: number, amount: number) => Promise<void>;
}

export function BuyinModal({ open, onClose, player, onBuyin }: BuyinModalProps) {
  const [amount, setAmount] = useState(50);
  const [loading, setLoading] = useState(false);

  if (!player) return null;

  const handleBuyin = async (buyinAmount: number) => {
    setLoading(true);
    try {
      await onBuyin(player.playerId, buyinAmount);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white border border-gray-200 max-w-sm shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-gray-900 text-lg tracking-widest flex items-center gap-2 justify-end">
            כניסה לשולחן
            <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <Coins className="w-4 h-4 text-red-600" />
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Player info */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center justify-between">
            <div className="text-red-600 font-black text-xl">{player.totalBuyins} ₪</div>
            <div className="text-right">
              <div className="text-gray-900 font-bold">{player.firstName} {player.lastName}</div>
              <div className="text-gray-400 text-xs mt-0.5">סה"כ הושקע עד כה</div>
            </div>
          </div>

          {/* Quick buy-in buttons */}
          <div className="space-y-2">
            <Label className="text-gray-400 text-xs tracking-wider font-semibold block text-right">כניסה מהירה</Label>
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 200].map(amt => (
                <button
                  key={amt}
                  onClick={() => handleBuyin(amt)}
                  disabled={loading}
                  className="casino-btn font-bold py-3 rounded-xl text-sm tracking-wider"
                  data-testid={`button-quick-buyin-${amt}`}
                >
                  +{amt} ₪
                  <div className="text-[10px] text-red-200 font-normal">{amt * 2} אסימונים</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div className="space-y-2">
            <Label className="text-gray-400 text-xs tracking-wider font-semibold block text-right">סכום מותאם</Label>
            <div className="flex gap-2">
              <Button
                onClick={() => handleBuyin(amount)}
                disabled={loading || amount <= 0}
                className="casino-btn font-bold px-4"
                data-testid="button-custom-buyin-confirm"
              >
                הוסף
              </Button>
              <Input
                type="number"
                value={amount}
                onChange={e => setAmount(parseInt(e.target.value) || 0)}
                min={1}
                step={50}
                className="bg-gray-50 border-gray-200 text-gray-900 text-center font-bold focus:border-red-400 focus:ring-red-100"
                data-testid="input-custom-buyin"
              />
            </div>
            <div className="text-center text-gray-400 text-xs">= {amount * 2} אסימונים (יחס 1:2)</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
