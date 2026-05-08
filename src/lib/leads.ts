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
}

const KEY = "swarshiksha:leads";
const EVENT = "swarshiksha:leads:changed";

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
  updateStatus(id: string, status: LeadStatus) {
    write(read().map((l) => (l.id === id ? { ...l, status } : l)));
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
