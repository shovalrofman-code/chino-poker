import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DoorClosed } from "lucide-react";

interface PlayerEntry {
  playerId: number;
  firstName: string;
  lastName: string;
  totalBuyins: number;
}

interface CloseSessionModalProps {
  open: boolean;
  onClose: () => void;
  players: PlayerEntry[];
  onClose2: (finalChips: Array<{ playerId: number; chips: number }>) => Promise<void>;
}

export function CloseSessionModal({ open, onClose, players, onClose2 }: CloseSessionModalProps) {
  const [chips, setChips] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalChips = players.map(p => ({
        playerId: p.playerId,
        chips: parseFloat(chips[p.playerId] || "0"),
      }));
      await onClose2(finalChips);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const totalBuyins = players.reduce((sum, p) => sum + p.totalBuyins, 0);
  const totalBuyinsChips = totalBuyins * 2;
  const enteredChips = players.reduce((sum, p) => sum + parseFloat(chips[p.playerId] || "0"), 0);
  const chipsDiff = enteredChips - totalBuyinsChips;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111] border border-[#333] text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-[#D4AF37] text-lg tracking-widest flex items-center gap-2">
            <DoorClosed className="w-5 h-5" />
            CLOSE SESSION
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="text-gray-400 text-xs tracking-wider">
            ENTER FINAL CHIP COUNT PER PLAYER
          </div>

          <div className="space-y-3">
            {players.map(player => (
              <div key={player.playerId} className="flex items-center gap-3 bg-[#1a1a1a] rounded p-3">
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">{player.firstName} {player.lastName}</div>
                  <div className="text-gray-500 text-xs">Buyins: <span className="text-[#D4AF37]">{player.totalBuyins} ₪</span> = {player.totalBuyins * 2} chips</div>
                </div>
                <Input
                  type="number"
                  placeholder="0"
                  value={chips[player.playerId] || ""}
                  onChange={e => setChips(prev => ({ ...prev, [player.playerId]: e.target.value }))}
                  className="w-28 bg-[#0a0a0a] border-[#333] text-white text-center font-bold"
                  min={0}
                  data-testid={`input-final-chips-${player.playerId}`}
                />
              </div>
            ))}
          </div>

          {/* Chip balance check */}
          <div className={`rounded p-3 text-sm ${Math.abs(chipsDiff) < 1 ? "bg-green-900/30 border border-green-800" : "bg-red-900/20 border border-red-900"}`}>
            <div className="flex justify-between">
              <span className="text-gray-400">Total chips in:</span>
              <span className="text-white font-bold">{totalBuyinsChips}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total chips entered:</span>
              <span className={`font-bold ${Math.abs(chipsDiff) < 1 ? "text-green-400" : "text-red-400"}`}>{enteredChips}</span>
            </div>
            {Math.abs(chipsDiff) >= 1 && (
              <div className="text-red-400 text-xs mt-1">
                Difference: {chipsDiff > 0 ? "+" : ""}{chipsDiff.toFixed(0)} chips
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || players.some(p => !chips[p.playerId])}
            className="casino-btn w-full text-white font-bold tracking-widest py-3"
            data-testid="button-confirm-close-session"
          >
            {loading ? "CALCULATING..." : "CLOSE & SETTLE"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
