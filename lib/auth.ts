/**
 * Security: Administrative Credentials.
 * Hardcoded for simplicity in this specific project context.
 */
const ADMIN_PASSWORD = "Shoval25";
const ADMIN_KEY = "poker_admin_auth";

/**
 * Checks if the current browser session is authenticated as admin.
 * SSR Safe: Returns false if called on the server.
 */
export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_KEY) === "true";
}

/**
 * Authenticates the user with a password.
 * Returns true if successful, false otherwise.
 */
export function login(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_KEY, "true");
    return true;
  }
  return false;
}

/**
 * Clears the administrative session.
 */
export function logout(): void {
  sessionStorage.removeItem(ADMIN_KEY);
}
