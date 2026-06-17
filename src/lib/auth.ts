import { supabase } from "@/lib/supabase";

const EVENT = "sursamyam:auth:changed";

export const ADMIN_EMAIL = "admin@sursamyam.com";

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

export const auth = {
  async getSession(): Promise<AdminSession | null> {
    return getSupabaseAdminSession();
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
      return {
        ok: false,
        error: "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      };
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

  async updatePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    if (!supabase) {
      return {
        ok: false,
        error: "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      };
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const email = sessionData.session?.user.email;

    if (sessionError || !email) {
      return { ok: false, error: "Please sign in again before changing the password." };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
      currentPassword,
    });

    if (updateError) {
      return { ok: false, error: updateError.message || "Unable to update password." };
    }

    notifyAuthChanged();
    return { ok: true };
  },

  async logout(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    }
    notifyAuthChanged();
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(EVENT, handler);

    const authSubscription = supabase?.auth.onAuthStateChange(() => {
      cb();
    }).data.subscription;

    return () => {
      window.removeEventListener(EVENT, handler);
      authSubscription?.unsubscribe();
    };
  },
};
