import { useEffect, useState } from "react";
import { auth, type AdminSession } from "@/lib/auth";

export function useAuth() {
  const [session, setSession] = useState<AdminSession | null>(() => auth.getSession());

  useEffect(() => auth.subscribe(() => setSession(auth.getSession())), []);

  return {
    session,
    isAuthenticated: session !== null,
    login: auth.login,
    logout: auth.logout,
  };
}
