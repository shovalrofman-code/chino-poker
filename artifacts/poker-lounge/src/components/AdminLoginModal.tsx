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
      setError("סיסמה שגויה");
      setPassword("");
    } else {
      setPassword("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white border border-gray-200 max-w-sm shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-gray-900 text-lg tracking-widest flex items-center gap-2 justify-end">
            כניסת מנהל
            <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <Lock className="w-4 h-4 text-red-600" />
            </div>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input
            type="password"
            placeholder="הזן סיסמת מנהל"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:ring-red-100 text-right"
            data-testid="input-admin-password"
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm text-right" data-testid="text-login-error">{error}</p>
          )}
          <Button
            type="submit"
            className="casino-btn w-full font-semibold tracking-wider"
            data-testid="button-admin-login"
          >
            כנס
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
