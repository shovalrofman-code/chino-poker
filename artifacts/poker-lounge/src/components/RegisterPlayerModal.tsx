import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCreatePlayer } from "@workspace/api-client-react";
import { UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListPlayersQueryKey } from "@workspace/api-client-react";

interface RegisterPlayerModalProps {
  open: boolean;
  onClose: () => void;
}

export function RegisterPlayerModal({ open, onClose }: RegisterPlayerModalProps) {
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createPlayer = useCreatePlayer();

  const handleClose = () => {
    setFirstName(""); setLastName(""); setPhone(""); setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) { setError("First name is required"); return; }
    setLoading(true); setError("");
    try {
      await createPlayer.mutateAsync({
        data: { firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), isGuest: false },
      });
      queryClient.invalidateQueries({ queryKey: getListPlayersQueryKey() });
      handleClose();
    } catch {
      setError("Failed to add player. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white border border-gray-200 max-w-sm shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-gray-900 text-lg tracking-widest flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-red-600" />
            </div>
            NEW PLAYER
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs tracking-wider font-semibold">FIRST NAME *</Label>
              <Input
                placeholder="Israel"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:ring-red-100"
                autoFocus
                data-testid="input-reg-first-name"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs tracking-wider font-semibold">LAST NAME</Label>
              <Input
                placeholder="Israeli"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:ring-red-100"
                data-testid="input-reg-last-name"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-gray-400 text-xs tracking-wider font-semibold">PHONE</Label>
            <Input
              placeholder="050-0000000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              type="tel"
              className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:ring-red-100"
              data-testid="input-reg-phone"
            />
          </div>

          {error && <div className="text-red-500 text-xs text-center">{error}</div>}

          <Button
            type="submit"
            disabled={loading || !firstName.trim()}
            className="casino-btn w-full font-bold tracking-widest py-3"
            data-testid="button-confirm-register-player"
          >
            {loading ? "Adding..." : "ADD TO REGISTRY"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
