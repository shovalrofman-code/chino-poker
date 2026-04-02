import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

  const totalBuyinsChips = players.reduce((sum, p) => sum + p.totalBuyins * 2, 0);
  const enteredChips = players.reduce((sum, p) => sum + parseFloat(chips[p.playerId] || "0"), 0);
  const chipsDiff = enteredChips - totalBuyinsChips;
  const balanced = Math.abs(chipsDiff) < 1;
  const allFilled = players.every(p => chips[p.playerId] && chips[p.playerId] !== "");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white border border-gray-200 max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-gray-900 text-lg tracking-widest flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <DoorClosed className="w-4 h-4 text-red-600" />
            </div>
            CLOSE SESSION
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <p className="text-gray-400 text-xs tracking-wider font-semibold">ENTER FINAL CHIP COUNT</p>

          <div className="space-y-2">
            {players.map(player => (
              <div key={player.playerId} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-bold text-xs">
                    {player.firstName[0]}{player.lastName?.[0] || ""}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 font-semibold text-sm truncate">{player.firstName} {player.lastName}</div>
                  <div className="text-gray-400 text-xs">{player.totalBuyins} ₪ = {player.totalBuyins * 2} chips</div>
                </div>
                <Input
                  type="number"
                  placeholder="0"
                  value={chips[player.playerId] || ""}
                  onChange={e => setChips(prev => ({ ...prev, [player.playerId]: e.target.value }))}
                  className="w-24 bg-white border-gray-200 text-gray-900 text-center font-bold focus:border-red-400 focus:ring-red-100"
                  min={0}
                  data-testid={`input-final-chips-${player.playerId}`}
                />
              </div>
            ))}
          </div>

          {/* Chip balance checker */}
          <div className={`rounded-xl p-3 text-sm border ${balanced ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Chips in play</span>
              <span className="text-gray-700 font-bold">{totalBuyinsChips}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-500 text-xs">Chips entered</span>
              <span className={`font-bold ${balanced ? "text-green-600" : "text-red-500"}`}>{enteredChips}</span>
            </div>
            {!balanced && enteredChips > 0 && (
              <div className="text-red-500 text-xs mt-1.5 font-semibold">
                ⚠️ Difference: {chipsDiff > 0 ? "+" : ""}{chipsDiff.toFixed(0)} chips
              </div>
            )}
            {balanced && allFilled && (
              <div className="text-green-600 text-xs mt-1.5 font-semibold">✅ Chips balance correctly</div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !allFilled}
            className="casino-btn w-full font-bold tracking-widest py-3"
            data-testid="button-confirm-close-session"
          >
            {loading ? "Calculating..." : "CLOSE & SETTLE"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
