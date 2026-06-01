import { supabase } from "@/lib/supabase";

const SESSION_KEY = "swarshiksha:admin-session";
const EVENT = "swarshiksha:auth:changed";

export const ADMIN_EMAIL = "admin@swarshiksha.com";
export const ADMIN_PASSWORD = "admin123";

export interface AdminSession {
  email: string;
  loggedInAt: string;
}

function notifyAuthChanged() {
  window.dispatchEvent(new Event(EVENT));
}

async function getSupabaseAdminSession(): Promise<AdminSession | null> {
  if (!supabase) return null;

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session?.user) return null;

  const user = sessionData.session.user;
  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id,email")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError || !admin) return null;

  return {
    email: typeof admin.email === "string" ? admin.email : user.email ?? "",
    loggedInAt: sessionData.session.created_at ?? new Date().toISOString(),
  };
}

function getLocalSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

export const auth = {
  async getSession(): Promise<AdminSession | null> {
    if (supabase) return getSupabaseAdminSession();
    return getLocalSession();
  },

  async isAuthenticated(): Promise<boolean> {
    return (await auth.getSession()) !== null;
  },

  async login(
    email: string,
    password: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const e = email.trim().toLowerCase();

    if (!supabase) {
      if (e !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
        return { ok: false, error: "Invalid email or password." };
      }
      const session: AdminSession = { email: ADMIN_EMAIL, loggedInAt: new Date().toISOString() };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      notifyAuthChanged();
      return { ok: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: e,
      password,
    });

    if (error || !data.user) {
      return { ok: false, error: error?.message ?? "Invalid email or password." };
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (adminError || !admin) {
      await supabase.auth.signOut();
      return { ok: false, error: "This account is not authorized for admin access." };
    }

    notifyAuthChanged();
    return { ok: true };
  },

  async logout(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    notifyAuthChanged();
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);

    const authSubscription = supabase?.auth.onAuthStateChange(() => {
      cb();
    }).data.subscription;

    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
      authSubscription?.unsubscribe();
    };
  },
};
