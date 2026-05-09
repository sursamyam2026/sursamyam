// Demo student accounts in localStorage. Replace with Supabase per `student-repository.interface.ts`.

import type {
  StudentAccount,
  StudentSession,
  EnrollmentFeeTrack,
  EnrollmentPaymentSnapshot,
} from "@/lib/student-auth.types";
import type {
  StudentAccountRepository,
  StudentSessionRepository,
} from "@/lib/repositories/student-repository.interface";
import { finalizeEnrollmentCheckout, leadsStore } from "@/lib/leads";

const ACCOUNTS_KEY = "swarshiksha:student-accounts";
const SESSION_KEY = "swarshiksha:student-session";
const EVENT = "swarshiksha:student-auth:changed";

function coerceStudent(raw: unknown): StudentAccount | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.email !== "string" || typeof o.password !== "string") return null;
  if (typeof o.name !== "string" || typeof o.createdAt !== "string") return null;
  const email = o.email.trim().toLowerCase();
  const snapshot = o.enrollmentSnapshot;
  return {
    id: o.id,
    email,
    name: o.name,
    password: o.password,
    createdAt: o.createdAt,
    phone: typeof o.phone === "string" ? o.phone : undefined,
    age: typeof o.age === "string" ? o.age : undefined,
    city: typeof o.city === "string" ? o.city : undefined,
    country: typeof o.country === "string" ? o.country : undefined,
    enrollmentSnapshot:
      snapshot && typeof snapshot === "object"
        ? (snapshot as EnrollmentPaymentSnapshot)
        : undefined,
  };
}

function readAccounts(): StudentAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(coerceStudent).filter(Boolean) as StudentAccount[];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StudentAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

const localAccounts: StudentAccountRepository = {
  findByEmail(email) {
    const n = email.trim().toLowerCase();
    return readAccounts().find((a) => a.email.trim().toLowerCase() === n);
  },
  create(account) {
    writeAccounts([...readAccounts(), account]);
  },
  delete(id) {
    writeAccounts(readAccounts().filter((a) => a.id !== id));
  },
};

const localSessionRepo: StudentSessionRepository = {
  getSession(): StudentSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as StudentSession) : null;
    } catch {
      return null;
    }
  },
  setSession(session: StudentSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event(EVENT));
  },
  clearSession() {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event(EVENT));
  },
  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  },
};

export const studentAccountsRepo = localAccounts;
export const studentSessionRepo = localSessionRepo;

export const studentAuth = {
  accounts: studentAccountsRepo,
  session: studentSessionRepo,

  isAuthenticated(): boolean {
    return studentSessionRepo.getSession() !== null;
  },

  register(
    name: string,
    email: string,
    password: string,
  ): { ok: true } | { ok: false; error: string } {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const pw = password;
    if (!trimmedName || !trimmedEmail || !pw) {
      return { ok: false, error: "Name, email, and password are required." };
    }
    if (studentAccountsRepo.findByEmail(trimmedEmail)) {
      return { ok: false, error: "An account exists for this email. Sign in instead." };
    }
    const lead = leadsStore.findByEmail(trimmedEmail);
    if (!lead) {
      return {
        ok: false,
        error: "No record found for this email. Submit the contact form first, then wait to be marked Converted.",
      };
    }
    if (lead.status !== "converted") {
      if (lead.status === "registered" || lead.status === "enrolled") {
        return { ok: false, error: "Already registered — use Student Login." };
      }
      return { ok: false, error: "Registration opens after your inquiry is marked Converted by Sur Samyam." };
    }

    const account: StudentAccount = {
      id: crypto.randomUUID(),
      email: trimmedEmail,
      name: trimmedName,
      password: pw,
      createdAt: new Date().toISOString(),
    };

    studentAccountsRepo.create(account);
    const linked = leadsStore.completeRegistration(trimmedEmail);
    if (!linked.ok) {
      studentAccountsRepo.delete(account.id);
      return { ok: false, error: linked.error };
    }

    studentSessionRepo.setSession({
      studentId: account.id,
      email: account.email,
      name: account.name,
      loggedInAt: new Date().toISOString(),
    });

    return { ok: true };
  },

  login(
    email: string,
    password: string,
  ): { ok: true } | { ok: false; error: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const acc = studentAccountsRepo.findByEmail(trimmedEmail);
    if (!acc || acc.password !== password) {
      return { ok: false, error: "Invalid email or password." };
    }
    studentSessionRepo.setSession({
      studentId: acc.id,
      email: acc.email,
      name: acc.name,
      loggedInAt: new Date().toISOString(),
    });
    return { ok: true };
  },

  logout() {
    studentSessionRepo.clearSession();
  },

  subscribe(cb: () => void): () => void {
    return studentSessionRepo.subscribe(cb);
  },

  /**
   * Self-serve enrollment (Step 2 "Next"): upsert lead → registered + create account + session.
   * Razorpay: replace internals to create order before session; reuse lead upsert post-success.
   */
  completeEnrollmentCheckout(input: {
    name: string;
    email: string;
    password: string;
    phone: string;
    age: string;
    city: string;
    country: string;
    track: EnrollmentFeeTrack;
    courseName: string;
    payment: EnrollmentPaymentSnapshot;
  }): { ok: true } | { ok: false; error: string } {
    const email = input.email.trim().toLowerCase();
    const pw = input.password;
    if (!email || !pw) {
      return { ok: false, error: "Email and password are required." };
    }
    if (studentAccountsRepo.findByEmail(email)) {
      return { ok: false, error: "An account exists for this email. Sign in to continue." };
    }

    finalizeEnrollmentCheckout({
      email,
      name: input.name.trim(),
      phone: input.phone.trim(),
      age: input.age.trim(),
      city: input.city.trim(),
      country: input.country.trim(),
      courseLine: `${input.courseName} (${input.track === "adults" ? "Adults" : "Kids"})`,
    });

    const account: StudentAccount = {
      id: crypto.randomUUID(),
      email,
      name: input.name.trim(),
      password: pw,
      createdAt: new Date().toISOString(),
      phone: input.phone.trim(),
      age: input.age.trim(),
      city: input.city.trim(),
      country: input.country.trim(),
      enrollmentSnapshot: input.payment,
    };

    studentAccountsRepo.create(account);
    studentSessionRepo.setSession({
      studentId: account.id,
      email: account.email,
      name: account.name,
      loggedInAt: new Date().toISOString(),
    });

    return { ok: true };
  },
};
