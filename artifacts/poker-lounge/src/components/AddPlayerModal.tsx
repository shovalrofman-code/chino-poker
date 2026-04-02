import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSearchPlayers, useCreatePlayer } from "@workspace/api-client-react";
import { UserPlus, UserCheck, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListPlayersQueryKey, getGetActiveSessionQueryKey } from "@workspace/api-client-react";

interface AddPlayerModalProps {
  open: boolean;
  onClose: () => void;
  onAddPlayer: (playerId: number, initialBuyin: number) => Promise<void>;
}

export function AddPlayerModal({ open, onClose, onAddPlayer }: AddPlayerModalProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: number; firstName: string; lastName: string; phone: string } | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [initialBuyin, setInitialBuyin] = useState(50);
  const [loading, setLoading] = useState(false);

  const createPlayer = useCreatePlayer();

  const { data: searchResults } = useSearchPlayers(
    { q: searchQuery },
    { query: { enabled: searchQuery.length > 1 && !selectedPlayer, queryKey: ["searchPlayers", searchQuery] } }
  );

  const handleSelectPlayer = (player: { id: number; firstName: string; lastName: string; phone: string }) => {
    setSelectedPlayer(player);
    setSearchQuery(`${player.firstName} ${player.lastName}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let playerId: number;
      if (selectedPlayer && !isGuest) {
        playerId = selectedPlayer.id;
      } else {
        const newPlayer = await createPlayer.mutateAsync({
          data: { firstName: firstName || "Guest", lastName, phone: phone || "", isGuest },
        });
        playerId = newPlayer.id;
        queryClient.invalidateQueries({ queryKey: getListPlayersQueryKey() });
      }
      await onAddPlayer(playerId, initialBuyin);
      queryClient.invalidateQueries({ queryKey: getGetActiveSessionQueryKey() });
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchQuery(""); setSelectedPlayer(null); setIsGuest(false);
    setFirstName(""); setLastName(""); setPhone(""); setInitialBuyin(50);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white border border-gray-200 max-w-md shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-gray-900 text-lg tracking-widest flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-red-600" />
            </div>
            ADD TO TABLE
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Regular / Guest toggle */}
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => { setIsGuest(false); setSelectedPlayer(null); setSearchQuery(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold tracking-wider transition-all flex items-center justify-center gap-1.5 ${!isGuest ? "bg-white shadow text-gray-900 border border-gray-200" : "text-gray-400"}`}
              data-testid="button-regular-player"
            >
              <UserCheck className="w-3.5 h-3.5" />
              REGULAR
            </button>
            <button
              type="button"
              onClick={() => { setIsGuest(true); setSelectedPlayer(null); setSearchQuery(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold tracking-wider transition-all ${isGuest ? "bg-white shadow text-gray-900 border border-gray-200" : "text-gray-400"}`}
              data-testid="button-guest-player"
            >
              GUEST
            </button>
          </div>

          {!isGuest ? (
            <div className="space-y-2">
              <Label className="text-gray-400 text-xs tracking-wider font-semibold">SEARCH PLAYER</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Type name or phone..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSelectedPlayer(null); }}
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 pl-9 focus:border-red-400 focus:ring-red-100"
                  data-testid="input-search-player"
                />
                {searchResults && searchResults.length > 0 && !selectedPlayer && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-44 overflow-y-auto">
                    {searchResults.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-3 py-2.5 hover:bg-gray-50 text-gray-900 text-sm border-b border-gray-50 last:border-0"
                        onClick={() => handleSelectPlayer(p)}
                        data-testid={`option-player-${p.id}`}
                      >
                        <span className="font-semibold">{p.firstName} {p.lastName}</span>
                        {p.phone && <span className="text-gray-400 ml-2 text-xs">{p.phone}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedPlayer && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 text-sm flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-xs">{selectedPlayer.firstName[0]}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-semibold">{selectedPlayer.firstName} {selectedPlayer.lastName}</span>
                    {selectedPlayer.phone && <span className="text-green-500 ml-2 text-xs">{selectedPlayer.phone}</span>}
                  </div>
                </div>
              )}
              {searchQuery && !selectedPlayer && searchResults?.length === 0 && (
                <div className="space-y-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <Label className="text-gray-400 text-xs font-semibold">NOT FOUND — CREATE NEW</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)}
                      className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-red-400" data-testid="input-first-name" />
                    <Input placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)}
                      className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-red-400" data-testid="input-last-name" />
                  </div>
                  <Input placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)}
                    className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-red-400" data-testid="input-phone" />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-gray-400 text-xs tracking-wider font-semibold">GUEST DETAILS</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)}
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-red-400" required data-testid="input-guest-first-name" />
                <Input placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)}
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-red-400" data-testid="input-guest-last-name" />
              </div>
            </div>
          )}

          {/* Buy-in amount */}
          <div className="space-y-2">
            <Label className="text-gray-400 text-xs tracking-wider font-semibold">INITIAL BUY-IN</Label>
            <div className="flex gap-2">
              {[50, 100, 200].map(amount => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setInitialBuyin(amount)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${initialBuyin === amount ? "casino-btn border-red-600" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-red-300"}`}
                  data-testid={`button-buyin-${amount}`}
                >
                  {amount} ₪
                </button>
              ))}
            </div>
            <div className="text-center text-gray-400 text-xs">{initialBuyin * 2} chips (1:2 ratio)</div>
          </div>

          <Button
            type="submit"
            disabled={loading || (!selectedPlayer && !isGuest && !firstName && !searchQuery)}
            className="casino-btn w-full font-bold tracking-widest py-3"
            data-testid="button-confirm-add-player"
          >
            {loading ? "Adding..." : "ADD TO TABLE"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
