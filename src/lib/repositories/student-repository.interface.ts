import type { StudentAccount, StudentSession } from "@/lib/student-auth.types";

/** Swap localStorage adapter for Supabase Auth + profiles later. */
export interface StudentAccountRepository {
  findByEmail(email: string): StudentAccount | undefined;
  create(account: StudentAccount): void;
  delete(id: string): void;
}

export interface StudentSessionRepository {
  getSession(): StudentSession | null;
  setSession(session: StudentSession): void;
  clearSession(): void;
  subscribe(cb: () => void): () => void;
}
