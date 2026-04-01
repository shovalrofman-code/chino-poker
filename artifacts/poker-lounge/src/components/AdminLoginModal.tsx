import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (password: string) => boolean;
}

export function AdminLoginModal({ open, onClose, onLogin }: AdminLoginModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (!success) {
      setError("Incorrect password");
      setPassword("");
    } else {
      setPassword("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111] border border-[#333] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-[#D4AF37] text-lg tracking-widest flex items-center gap-2">
            <Lock className="w-5 h-5" />
            ADMIN ACCESS
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-600 focus:border-red-600"
            data-testid="input-admin-password"
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm" data-testid="text-login-error">{error}</p>
          )}
          <Button
            type="submit"
            className="casino-btn w-full text-white font-semibold tracking-wider"
            data-testid="button-admin-login"
          >
            ENTER
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
