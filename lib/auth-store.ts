const SESSION_KEY = "pipeguard_authed";

export const CREDENTIALS = {
  username: "admin",
  password: "1234",
} as const;

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function login(username: string, password: string): boolean {
  if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
    sessionStorage.setItem(SESSION_KEY, "1");
    return true;
  }
  return false;
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
