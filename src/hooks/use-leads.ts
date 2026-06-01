import { useEffect, useState } from "react";
import { leadsStore, type Lead } from "@/lib/leads";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    try {
      setError(null);
      setLeads(await leadsStore.list());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unable to load leads."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    return leadsStore.subscribe(() => {
      void refresh();
    });
  }, []);

  return { leads, isLoading, error, refresh };
}
