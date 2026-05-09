// Local-storage backed Leads collection (demo only).
// NOTE: For production, swap this out for Lovable Cloud (real DB + RLS).

export type LeadStatus = "new" | "contacted" | "converted";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: LeadStatus;
  createdAt: string; // ISO
  rollNumber?: string;
  enrolledAt?: string; // ISO
}

const KEY = "swarshiksha:leads";
const ROLL_META_KEY = "swarshiksha:roll-meta";
const EVENT = "swarshiksha:leads:changed";
const ROLL_PREFIX = "SS";

interface RollMeta {
  yearlyCounters: Record<string, number>;
}

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

    if (status === "converted") {
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
