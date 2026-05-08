// Demo-only auth backed by localStorage.
// ⚠️ Insecure: anyone with devtools can bypass this. Replace with Lovable Cloud for production.

const SESSION_KEY = "swarshiksha:admin-session";
const EVENT = "swarshiksha:auth:changed";

// Change these to your preferred demo credentials.
export const ADMIN_EMAIL = "admin@swarshiksha.com";
export const ADMIN_PASSWORD = "admin123";

export interface AdminSession {
  email: string;
  loggedInAt: string;
}

export const auth = {
  getSession(): AdminSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AdminSession) : null;
    } catch {
      return null;
    }
  },
  isAuthenticated(): boolean {
    return auth.getSession() !== null;
  },
  login(email: string, password: string): { ok: true } | { ok: false; error: string } {
    const e = email.trim().toLowerCase();
    if (e !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
      return { ok: false, error: "Invalid email or password." };
    }
    const session: AdminSession = { email: ADMIN_EMAIL, loggedInAt: new Date().toISOString() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event(EVENT));
    return { ok: true };
  },
  logout() {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event(EVENT));
  },
  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  },
};
