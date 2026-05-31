"use client";

import { useState, useCallback, useEffect } from "react";
import { isAdmin, login, logout } from "@/lib/auth";

/**
 * Hook: Administrative State Management.
 * Handles persistent admin login status using sessionStorage.
 */
export function useAdmin() {
  const [adminMode, setAdminMode] = useState<boolean>(false);

  // Sync state with storage on mount
  useEffect(() => {
    setAdminMode(isAdmin());
  }, []);

  const doLogin = useCallback((password: string): boolean => {
    const success = login(password);
    if (success) {
      setAdminMode(true);
    }
    return success;
  }, []);

  const doLogout = useCallback(() => {
    logout();
    setAdminMode(false);
  }, []);

  return { 
    adminMode, 
    login: doLogin, 
    logout: doLogout 
  };
}
