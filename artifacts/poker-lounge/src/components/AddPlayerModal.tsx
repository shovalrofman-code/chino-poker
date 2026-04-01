import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSearchPlayers, useCreatePlayer } from "@workspace/api-client-react";
import { UserPlus, UserCheck } from "lucide-react";
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
    setSearchQuery("");
    setSelectedPlayer(null);
    setIsGuest(false);
    setFirstName("");
    setLastName("");
    setPhone("");
    setInitialBuyin(50);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#111] border border-[#333] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-[#D4AF37] text-lg tracking-widest flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            ADD PLAYER
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Guest toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setIsGuest(false); setSelectedPlayer(null); setSearchQuery(""); }}
              className={`flex-1 py-2 rounded text-sm font-semibold tracking-wider transition-all ${!isGuest ? "casino-btn text-white" : "bg-[#1a1a1a] text-gray-400 border border-[#333]"}`}
              data-testid="button-regular-player"
            >
              <UserCheck className="w-4 h-4 inline mr-1" />
              REGULAR
            </button>
            <button
              type="button"
              onClick={() => { setIsGuest(true); setSelectedPlayer(null); setSearchQuery(""); }}
              className={`flex-1 py-2 rounded text-sm font-semibold tracking-wider transition-all ${isGuest ? "casino-btn text-white" : "bg-[#1a1a1a] text-gray-400 border border-[#333]"}`}
              data-testid="button-guest-player"
            >
              GUEST
            </button>
          </div>

          {!isGuest ? (
            <div className="space-y-2">
              <Label className="text-gray-400 text-xs tracking-wider">SEARCH EXISTING PLAYER</Label>
              <div className="relative">
                <Input
                  placeholder="Type a name..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSelectedPlayer(null); }}
                  className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-600 focus:border-red-600"
                  data-testid="input-search-player"
                />
                {searchResults && searchResults.length > 0 && !selectedPlayer && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-[#1a1a1a] border border-[#333] rounded-b-lg mt-0.5 shadow-xl max-h-40 overflow-y-auto">
                    {searchResults.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-[#2a2a2a] text-white text-sm"
                        onClick={() => handleSelectPlayer(p)}
                        data-testid={`option-player-${p.id}`}
                      >
                        <span className="font-semibold">{p.firstName} {p.lastName}</span>
                        <span className="text-gray-500 ml-2 text-xs">{p.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedPlayer && (
                <div className="bg-[#1a2a1a] border border-green-800 rounded p-2 text-sm">
                  <span className="text-green-400">Selected: </span>
                  <span className="text-white font-semibold">{selectedPlayer.firstName} {selectedPlayer.lastName}</span>
                  <span className="text-gray-400 ml-2 text-xs">{selectedPlayer.phone}</span>
                </div>
              )}
              {searchQuery && !selectedPlayer && searchResults?.length === 0 && (
                <div className="space-y-2 pt-1">
                  <Label className="text-gray-500 text-xs">NOT FOUND - CREATE NEW:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="First name"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-600"
                      data-testid="input-first-name"
                    />
                    <Input
                      placeholder="Last name"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-600"
                      data-testid="input-last-name"
                    />
                  </div>
                  <Input
                    placeholder="Phone number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-600"
                    data-testid="input-phone"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-gray-400 text-xs tracking-wider">GUEST PLAYER DETAILS</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="First name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-600"
                  required
                  data-testid="input-guest-first-name"
                />
                <Input
                  placeholder="Last name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-600"
                  data-testid="input-guest-last-name"
                />
              </div>
            </div>
          )}

          {/* Initial Buy-in */}
          <div className="space-y-2">
            <Label className="text-gray-400 text-xs tracking-wider">INITIAL BUY-IN (NIS)</Label>
            <div className="flex gap-2">
              {[50, 100, 200].map(amount => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setInitialBuyin(amount)}
                  className={`flex-1 py-2 rounded text-sm font-bold transition-all ${initialBuyin === amount ? "casino-btn text-white" : "bg-[#1a1a1a] text-gray-300 border border-[#333]"}`}
                  data-testid={`button-buyin-${amount}`}
                >
                  {amount} ₪
                </button>
              ))}
            </div>
            <div className="text-center text-gray-500 text-xs">
              = {initialBuyin * 2} chips (ratio 1:2)
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || (!selectedPlayer && !isGuest && !firstName && !searchQuery)}
            className="casino-btn w-full text-white font-bold tracking-widest py-3"
            data-testid="button-confirm-add-player"
          >
            {loading ? "ADDING..." : "ADD TO TABLE"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
