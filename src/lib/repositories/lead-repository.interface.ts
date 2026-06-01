import type { Lead, LeadStatus } from "@/lib/leads.types";

/** Contract for lead persistence — replace localStorage adapter with Supabase later. */
export interface LeadRepository {
  list(): Promise<Lead[]>;
  add(input: Omit<Lead, "id" | "status" | "createdAt">): Promise<Lead>;
  updateStatus(
    id: string,
    status: LeadStatus,
  ): Promise<{ lead?: Lead; assignedRollNumber?: string }>;
  remove(id: string): Promise<void>;
  findByEmail(email: string): Promise<Lead | null>;
  subscribe(cb: () => void): () => void;
}
