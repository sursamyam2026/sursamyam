import { useEffect, useState } from "react";
import { leadsStore, type Lead } from "@/lib/leads";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>(() => leadsStore.list());

  useEffect(() => leadsStore.subscribe(() => setLeads(leadsStore.list())), []);

  return leads;
}
