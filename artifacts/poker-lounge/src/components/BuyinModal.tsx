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
      <DialogContent className="bg-[#111] border border-[#333] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-[#D4AF37] text-lg tracking-widest flex items-center gap-2">
            <Coins className="w-5 h-5" />
            BUY-IN
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="text-center py-2">
            <div className="text-white font-semibold text-lg">{player.firstName} {player.lastName}</div>
            <div className="text-gray-500 text-sm">Total: <span className="text-[#D4AF37] font-bold">{player.totalBuyins} ₪</span></div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400 text-xs tracking-wider">QUICK BUY-IN</Label>
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 200].map(amt => (
                <button
                  key={amt}
                  onClick={() => handleBuyin(amt)}
                  disabled={loading}
                  className="casino-btn text-white font-bold py-3 rounded text-sm tracking-wider disabled:opacity-50"
                  data-testid={`button-quick-buyin-${amt}`}
                >
                  +{amt} ₪
                  <div className="text-[10px] text-red-200 font-normal">{amt * 2} chips</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400 text-xs tracking-wider">CUSTOM AMOUNT</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={amount}
                onChange={e => setAmount(parseInt(e.target.value) || 0)}
                min={1}
                step={50}
                className="bg-[#1a1a1a] border-[#333] text-white"
                data-testid="input-custom-buyin"
              />
              <Button
                onClick={() => handleBuyin(amount)}
                disabled={loading || amount <= 0}
                className="casino-btn text-white font-bold px-4"
                data-testid="button-custom-buyin-confirm"
              >
                ADD
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
