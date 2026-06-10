import type { Lead, LeadStatus } from "@/lib/leads.types";

/** Contract for Supabase-backed lead persistence. */
export interface LeadRepository {
  list(): Promise<Lead[]>;
  add(input: Omit<Lead, "id" | "status" | "createdAt">): Promise<Lead>;
  importWithStatus(
    input: Omit<Lead, "id" | "createdAt">,
  ): Promise<{ lead: Lead; assignedRollNumber?: string }>;
  updateStatus(
    id: string,
    status: LeadStatus,
  ): Promise<{ lead?: Lead; assignedRollNumber?: string }>;
  updateDetails(id: string, input: Partial<Pick<Lead, "name" | "phone" | "message">>): Promise<Lead | undefined>;
  remove(id: string): Promise<void>;
  findByEmail(email: string): Promise<Lead | null>;
  subscribe(cb: () => void): () => void;
}
