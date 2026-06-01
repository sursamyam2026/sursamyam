import { useEffect, useState } from "react";
import { auth, type AdminSession } from "@/lib/auth";

export function useAuth() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    setSession(await auth.getSession());
    setIsLoading(false);
  };

  useEffect(() => {
    void refresh();
    return auth.subscribe(() => {
      void refresh();
    });
  }, []);

  return {
    session,
    isLoading,
    isAuthenticated: session !== null,
    login: auth.login,
    logout: auth.logout,
  };
}
