// Local-storage lead persistence. Swap `implements LeadRepository` adapter for Supabase later.
// See `@/lib/repositories/lead-repository.interface`.

import type { LeadRepository } from "@/lib/repositories/lead-repository.interface";
import type { Lead, LeadStatus } from "@/lib/leads.types";

export type { Lead, LeadStatus };

const KEY = "swarshiksha:leads";
const ROLL_META_KEY = "swarshiksha:roll-meta";
const EVENT = "swarshiksha:leads:changed";
const ROLL_PREFIX = "SS";

const VALID_STATUSES = new Set<LeadStatus>([
  "new",
  "contacted",
  "converted",
  "registered",
  "enrolled",
  "declined",
]);

function coerceLead(raw: unknown): Lead | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : "";
  const email = typeof o.email === "string" ? o.email : "";
  if (!id || !email) return null;

  let status = typeof o.status === "string" ? o.status : "new";
  if (!VALID_STATUSES.has(status as LeadStatus)) status = "new";

  return {
    id,
    name: typeof o.name === "string" ? o.name : "",
    email,
    phone: typeof o.phone === "string" ? o.phone : undefined,
    message: typeof o.message === "string" ? o.message : "",
    status: status as LeadStatus,
    createdAt: typeof o.createdAt === "string" ? o.createdAt : new Date().toISOString(),
    rollNumber: typeof o.rollNumber === "string" ? o.rollNumber : undefined,
    enrolledAt: typeof o.enrolledAt === "string" ? o.enrolledAt : undefined,
  };
}

interface RollMeta {
  yearlyCounters: Record<string, number>;
}

function read(): Lead[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(coerceLead).filter(Boolean) as Lead[];
  } catch {
    return [];
  }
}

function write(leads: Lead[]) {
  localStorage.setItem(KEY, JSON.stringify(leads));
  window.dispatchEvent(new Event(EVENT));
}

function readRollMeta(): RollMeta {
  try {
    const raw = localStorage.getItem(ROLL_META_KEY);
    if (!raw) return { yearlyCounters: {} };
    const parsed = JSON.parse(raw) as RollMeta;
    return parsed?.yearlyCounters ? parsed : { yearlyCounters: {} };
  } catch {
    return { yearlyCounters: {} };
  }
}

function writeRollMeta(meta: RollMeta) {
  localStorage.setItem(ROLL_META_KEY, JSON.stringify(meta));
}

function getMaxAssignedForYear(leads: Lead[], year: string): number {
  return leads.reduce((max, lead) => {
    const match = lead.rollNumber?.match(/^SS-(\d{4})-(\d{3})$/);
    if (!match || match[1] !== year) return max;
    return Math.max(max, Number.parseInt(match[2], 10));
  }, 0);
}

function nextRollNumber(leads: Lead[], assignedAt = new Date()): string {
  const year = String(assignedAt.getFullYear());
  const meta = readRollMeta();
  const currentCounter = meta.yearlyCounters[year] ?? 0;
  const maxFromData = getMaxAssignedForYear(leads, year);
  const nextCounter = Math.max(currentCounter, maxFromData) + 1;
  meta.yearlyCounters[year] = nextCounter;
  writeRollMeta(meta);
  return `${ROLL_PREFIX}-${year}-${String(nextCounter).padStart(3, "0")}`;
}

export interface FinalizeEnrollmentInput {
  email: string;
  name: string;
  phone: string;
  age: string;
  city: string;
  country: string;
  courseLine: string;
}

/** Upsert lead and mark registered after demo checkout (Razorpay later). */
export function finalizeEnrollmentCheckout(input: FinalizeEnrollmentInput): void {
  const leads = read();
  const needle = input.email.trim().toLowerCase();
  const note = [
    `[Online enrollment ${new Date().toISOString().slice(0, 10)}]`,
    `Course: ${input.courseLine}`,
    `Age: ${input.age}`,
    `${input.city.trim()}, ${input.country.trim()}`,
  ].join("\n");

  const idx = leads.findIndex((l) => l.email.trim().toLowerCase() === needle);
  if (idx >= 0) {
    const cur = leads[idx];
    leads[idx] = {
      ...cur,
      name: input.name.trim() || cur.name,
      phone: input.phone.trim() || cur.phone,
      message: cur.message.trim() ? `${cur.message.trim()}\n\n${note}` : note,
      status: cur.status === "enrolled" ? cur.status : "registered",
    };
  } else {
    leads.unshift({
      id: crypto.randomUUID(),
      name: input.name.trim(),
      email: needle,
      phone: input.phone.trim() || undefined,
      message: note,
      status: "registered",
      createdAt: new Date().toISOString(),
    });
  }
  write(leads);
}

const localLeadStore: LeadRepository = {
  list() {
    return read().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  add(input: Omit<Lead, "id" | "status" | "createdAt">): Lead {
    const lead: Lead = {
      ...input,
      id: crypto.randomUUID(),
      status: "new",
      createdAt: new Date().toISOString(),
    };
    write([lead, ...read()]);
    return lead;
  },

  updateStatus(
    id: string,
    status: LeadStatus,
  ): { lead?: Lead; assignedRollNumber?: string } {
    const leads = read();
    const index = leads.findIndex((l) => l.id === id);
    if (index === -1) return {};

    const current = leads[index];
    let assignedRollNumber: string | undefined;
    let rollNumber = current.rollNumber;
    let enrolledAt = current.enrolledAt;

    // Option A: roll number only when admin marks enrolled (never auto on converted).
    if (status === "enrolled") {
      if (!rollNumber) {
        rollNumber = nextRollNumber(leads);
        assignedRollNumber = rollNumber;
      }
      if (!enrolledAt) {
        enrolledAt = new Date().toISOString();
      }
    }

    const updated: Lead = {
      ...current,
      status,
      rollNumber,
      enrolledAt,
    };

    leads[index] = updated;
    write(leads);
    return { lead: updated, assignedRollNumber };
  },

  completeRegistration(email: string): { ok: true } | { ok: false; error: string } {
    const needle = email.trim().toLowerCase();
    if (!needle) return { ok: false, error: "Email is required." };

    const leads = read();
    const match = leads
      .filter((l) => l.email.trim().toLowerCase() === needle)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    if (!match) {
      return { ok: false, error: "No lead found for this email. Submit the contact form first." };
    }
    if (match.status === "registered") {
      return { ok: true };
    }
    if (match.status !== "converted") {
      return {
        ok: false,
        error:
          match.status === "enrolled"
            ? "You are already enrolled — sign in to your student account."
            : "Registration opens after an admin marks your inquiry as Converted.",
      };
    }

    const idx = leads.findIndex((l) => l.id === match.id);
    if (idx === -1) return { ok: false, error: "Lead not found." };

    leads[idx] = { ...match, status: "registered" };
    write(leads);

    return { ok: true };
  },

  remove(id: string) {
    write(read().filter((l) => l.id !== id));
  },

  findByEmail(email: string): Lead | null {
    const needle = email.trim().toLowerCase();
    if (!needle) return null;
    return (
      read()
        .filter((l) => l.email.trim().toLowerCase() === needle)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null
    );
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

/** Default persistence — swap for a Supabase-backed `LeadRepository` when ready. */
export const leadsRepository: LeadRepository = localLeadStore;

/** Backward-compatible facade */
export const leadsStore = leadsRepository;
