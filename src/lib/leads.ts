// Local-storage backed Leads collection (demo only).
// NOTE: For production, swap this out for Lovable Cloud (real DB + RLS).

export type LeadStatus = "new" | "contacted" | "converted" | "registered" | "enrolled" | "declined";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: LeadStatus;
  createdAt: string; // ISO
  rollNumber?: string;
  enrolledAt?: string; // ISO — set when status becomes enrolled
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

const KEY = "swarshiksha:leads";
const ROLL_META_KEY = "swarshiksha:roll-meta";
const EVENT = "swarshiksha:leads:changed";
const ROLL_PREFIX = "SS";

function read(): Lead[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(leads: Lead[]) {
  localStorage.setItem(KEY, JSON.stringify(leads));
  window.dispatchEvent(new Event(EVENT));
}

function readRollMeta(): Record<string, number> {
  try {
    const raw = localStorage.getItem(ROLL_META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeRollMeta(meta: Record<string, number>) {
  localStorage.setItem(ROLL_META_KEY, JSON.stringify(meta));
}

function nextRollNumber(): string {
  const year = String(new Date().getFullYear());
  const meta = readRollMeta();
  const counter = (meta[year] ?? 0) + 1;
  meta[year] = counter;
  writeRollMeta(meta);
  return `${ROLL_PREFIX}-${year}-${String(counter).padStart(3, "0")}`;
}

/** Save enrollment as a lead with "registered" status. Admin marks as "enrolled" after payment. */
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
      status: "registered",
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

export const leadsStore = {
  list(): Lead[] {
    return read().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
  updateStatus(id: string, status: LeadStatus): { assignedRollNumber?: string } {
    const leads = read();
    const idx = leads.findIndex((l) => l.id === id);
    if (idx === -1) return {};

    const cur = leads[idx];
    let rollNumber = cur.rollNumber;
    let enrolledAt = cur.enrolledAt;

    if (status === "enrolled") {
      if (!rollNumber) {
        rollNumber = nextRollNumber();
      }
      if (!enrolledAt) {
        enrolledAt = new Date().toISOString();
      }
    }

    leads[idx] = {
      ...cur,
      status,
      rollNumber: rollNumber || cur.rollNumber,
      enrolledAt: enrolledAt || cur.enrolledAt,
    };
    write(leads);
    return { assignedRollNumber: rollNumber && !cur.rollNumber ? rollNumber : undefined };
  },
  remove(id: string) {
    write(read().filter((l) => l.id !== id));
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