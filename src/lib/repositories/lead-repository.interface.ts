import type { Lead, LeadStatus } from "@/lib/leads.types";

/** Contract for lead persistence — replace localStorage adapter with Supabase later. */
export interface LeadRepository {
  list(): Lead[];
  add(input: Omit<Lead, "id" | "status" | "createdAt">): Lead;
  updateStatus(
    id: string,
    status: LeadStatus,
  ): { lead?: Lead; assignedRollNumber?: string };
  completeRegistration(email: string): { ok: true } | { ok: false; error: string };
  remove(id: string): void;
  findByEmail(email: string): Lead | null;
  subscribe(cb: () => void): () => void;
}
