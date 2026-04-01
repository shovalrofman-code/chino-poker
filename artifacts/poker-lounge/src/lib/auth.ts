const ADMIN_PASSWORD = "Shoval25";
const ADMIN_KEY = "poker_admin_auth";

export function isAdmin(): boolean {
  return sessionStorage.getItem(ADMIN_KEY) === "true";
}

export function login(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_KEY, "true");
    return true;
  }
  return false;
}

export function logout(): void {
  sessionStorage.removeItem(ADMIN_KEY);
}
