import { useState, useCallback } from "react";
import { isAdmin, login, logout } from "@/lib/auth";

export function useAdmin() {
  const [adminMode, setAdminMode] = useState<boolean>(isAdmin());

  const doLogin = useCallback((password: string): boolean => {
    const success = login(password);
    if (success) setAdminMode(true);
    return success;
  }, []);

  const doLogout = useCallback(() => {
    logout();
    setAdminMode(false);
  }, []);

  return { adminMode, login: doLogin, logout: doLogout };
}
