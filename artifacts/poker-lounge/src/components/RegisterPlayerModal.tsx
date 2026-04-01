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
    setFirstName("");
    setLastName("");
    setPhone("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createPlayer.mutateAsync({
        data: { firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), isGuest: false },
      });
      queryClient.invalidateQueries({ queryKey: getListPlayersQueryKey() });
      handleClose();
    } catch (err: any) {
      setError("Failed to add player. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#111] border border-[#333] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-white text-lg tracking-widest flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-red-500" />
            רישום שחקן חדש
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs tracking-wider">שם פרטי *</Label>
              <Input
                placeholder="ישראל"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-600 focus:border-red-600"
                autoFocus
                data-testid="input-reg-first-name"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs tracking-wider">שם משפחה</Label>
              <Input
                placeholder="ישראלי"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-600 focus:border-red-600"
                data-testid="input-reg-last-name"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-gray-400 text-xs tracking-wider">מספר טלפון</Label>
            <Input
              placeholder="050-0000000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              type="tel"
              className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-600 focus:border-red-600"
              data-testid="input-reg-phone"
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs text-center">{error}</div>
          )}

          <Button
            type="submit"
            disabled={loading || !firstName.trim()}
            className="casino-btn w-full text-white font-bold tracking-widest py-3"
            data-testid="button-confirm-register-player"
          >
            {loading ? "מוסיף..." : "הוסף לקבוצה"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
