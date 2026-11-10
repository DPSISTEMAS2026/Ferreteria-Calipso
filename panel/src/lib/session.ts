export const api = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3011";

const KEY = "calipso-panel";

export type PanelUser = {
  id: string;
  name: string;
  role: "dueno" | "caja";
};

type Saved = { token: string; user: PanelUser };

export function readSession(): Saved | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as Saved : null;
  } catch {
    return null;
  }
}

export function writeSession(token: string, user: PanelUser) {
  sessionStorage.setItem(KEY, JSON.stringify({ token, user }));
}

export function clearSession() {
  sessionStorage.removeItem(KEY);
}

export function authHeaders(): HeadersInit {
  const token = readSession()?.token;
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}
