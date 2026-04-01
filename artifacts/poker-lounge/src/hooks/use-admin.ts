import { useState, useEffect } from "react";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const status = sessionStorage.getItem("admin_status");
    if (status === "true") {
      setIsAdmin(true);
    }
  }, []);

  const login = (password: string) => {
    if (password === "poker2024") {
      sessionStorage.setItem("admin_status", "true");
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem("admin_status");
    setIsAdmin(false);
  };

  return { isAdmin, login, logout };
}
