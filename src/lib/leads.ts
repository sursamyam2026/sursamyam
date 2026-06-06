// Lead persistence. Uses Supabase when VITE_SUPABASE_* env vars are present,
// otherwise falls back to localStorage for local development.

import { supabase } from "@/lib/supabase";
import type { LeadRepository } from "@/lib/repositories/lead-repository.interface";
import type { Lead, LeadStatus } from "@/lib/leads.types";

export type { Lead, LeadStatus };

export interface FinalizeEnrollmentInput {
  email: string;
  name: string;
  phone: string;
  age: string;
  city: string;
  country: string;
  courseLine: string;
}

interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: LeadStatus;
  created_at: string;
  roll_number: string | null;
  enrolled_at: string | null;
}

interface RollMeta {
  yearlyCounters: Record<string, number>;
}

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
  "discontinued",
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

function fromRow(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    rollNumber: row.roll_number ?? undefined,
    enrolledAt: row.enrolled_at ?? undefined,
  };
}

function toInsert(input: Omit<Lead, "id" | "status" | "createdAt">) {
  return {
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    message: input.message,
    roll_number: input.rollNumber ?? null,
    enrolled_at: input.enrolledAt ?? null,
  };
}

function assertImportStatus(status: LeadStatus) {
  if (status !== "registered" && status !== "enrolled") {
    throw new Error("Bulk upload can only import registered or enrolled students.");
  }
}

function readLocal(): Lead[] {
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

function writeLocal(leads: Lead[]) {
  localStorage.setItem(KEY, JSON.stringify(leads));
  window.dispatchEvent(new Event(EVENT));
}

function readLocalRollMeta(): RollMeta {
  try {
    const raw = localStorage.getItem(ROLL_META_KEY);
    if (!raw) return { yearlyCounters: {} };
    const parsed = JSON.parse(raw) as RollMeta;
    return parsed?.yearlyCounters ? parsed : { yearlyCounters: {} };
  } catch {
    return { yearlyCounters: {} };
  }
}

function writeLocalRollMeta(meta: RollMeta) {
  localStorage.setItem(ROLL_META_KEY, JSON.stringify(meta));
}

function getMaxAssignedForYear(leads: Lead[], year: string): number {
  return leads.reduce((max, lead) => {
    const match = lead.rollNumber?.match(/^SS-(\d{4})-(\d{3})$/);
    if (!match || match[1] !== year) return max;
    return Math.max(max, Number.parseInt(match[2], 10));
  }, 0);
}

async function readSupabaseRollMeta(): Promise<RollMeta> {
  if (!supabase) return { yearlyCounters: {} };
  const { data, error } = await supabase
    .from("roll_meta")
    .select("yearly_counters")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;
  const yearlyCounters = data?.yearly_counters;
  return yearlyCounters && typeof yearlyCounters === "object"
    ? { yearlyCounters: yearlyCounters as Record<string, number> }
    : { yearlyCounters: {} };
}

async function writeSupabaseRollMeta(meta: RollMeta): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from("roll_meta")
    .upsert({ id: 1, yearly_counters: meta.yearlyCounters });
  if (error) throw error;
}

async function nextRollNumber(leads: Lead[], assignedAt = new Date()): Promise<string> {
  const year = String(assignedAt.getFullYear());
  const meta = supabase ? await readSupabaseRollMeta() : readLocalRollMeta();
  const currentCounter = meta.yearlyCounters[year] ?? 0;
  const maxFromData = getMaxAssignedForYear(leads, year);
  const nextCounter = Math.max(currentCounter, maxFromData) + 1;
  meta.yearlyCounters[year] = nextCounter;

  if (supabase) {
    await writeSupabaseRollMeta(meta);
  } else {
    writeLocalRollMeta(meta);
  }

  return `${ROLL_PREFIX}-${year}-${String(nextCounter).padStart(3, "0")}`;
}

/** Upsert lead and mark registered (admin sets enrolled after payment confirmation). */
export async function finalizeEnrollmentCheckout(input: FinalizeEnrollmentInput): Promise<void> {
  const needle = input.email.trim().toLowerCase();
  const note = [
    `[Online enrollment ${new Date().toISOString().slice(0, 10)}]`,
    `Course: ${input.courseLine}`,
    `Age: ${input.age}`,
    `${input.city.trim()}, ${input.country.trim()}`,
  ].join("\n");

  if (supabase) {
    const { error } = await supabase.rpc("finalize_enrollment_lead", {
      p_email: needle,
      p_name: input.name.trim(),
      p_phone: input.phone.trim() || null,
      p_note: note,
    });

    if (error) throw error;
    window.dispatchEvent(new Event(EVENT));
    return;
  }

  const leads = await leadsRepository.list();
  const current = leads.find((l) => l.email.trim().toLowerCase() === needle);
  if (current) {
    const message = current.message.trim() ? `${current.message.trim()}\n\n${note}` : note;
    const updated = leads.map((lead) =>
      lead.id === current.id
        ? {
            ...lead,
            name: input.name.trim() || lead.name,
            phone: input.phone.trim() || lead.phone,
            message,
            status: "registered" as const,
          }
        : lead,
    );
    writeLocal(updated);
    return;
  }

  writeLocal([
    {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      email: needle,
      phone: input.phone.trim() || undefined,
      message: note,
      status: "registered",
      createdAt: new Date().toISOString(),
    },
    ...leads,
  ]);
}

const supabaseLeadStore: LeadRepository = {
  async list() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("leads")
      .select("id,name,email,phone,message,status,created_at,roll_number,enrolled_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return ((data ?? []) as LeadRow[]).map(fromRow);
  },

  async add(input) {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.rpc("submit_contact_lead", {
      p_name: input.name,
      p_email: input.email,
      p_phone: input.phone ?? null,
      p_message: input.message,
    }).single();

    if (error) throw error;
    window.dispatchEvent(new Event(EVENT));
    return fromRow(data as LeadRow);
  },

  async importWithStatus(input) {
    if (!supabase) throw new Error("Supabase is not configured.");
    assertImportStatus(input.status);

    const leads = await this.list();
    let assignedRollNumber: string | undefined;
    let rollNumber = input.rollNumber;
    let enrolledAt = input.enrolledAt;

    if (input.status === "enrolled") {
      if (!rollNumber) {
        rollNumber = await nextRollNumber(leads);
        assignedRollNumber = rollNumber;
      }
      if (!enrolledAt) {
        enrolledAt = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from("leads")
      .insert({
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        message: input.message,
        status: input.status,
        roll_number: rollNumber ?? null,
        enrolled_at: enrolledAt ?? null,
      })
      .select("id,name,email,phone,message,status,created_at,roll_number,enrolled_at")
      .single();

    if (error) throw error;
    window.dispatchEvent(new Event(EVENT));
    return { lead: fromRow(data as LeadRow), assignedRollNumber };
  },

  async updateStatus(id, status) {
    if (!supabase) return {};
    const leads = await this.list();
    const current = leads.find((l) => l.id === id);
    if (!current) return {};

    let assignedRollNumber: string | undefined;
    let rollNumber = current.rollNumber;
    let enrolledAt = current.enrolledAt;

    if (status === "registered" && current.status !== "registered") {
      throw new Error("Registered status can only come from registration flow or bulk upload.");
    }

    if (status === "enrolled" && current.status !== "registered" && current.status !== "enrolled") {
      throw new Error("Only registered students can be marked as enrolled.");
    }

    if (status === "discontinued" && current.status !== "enrolled" && current.status !== "discontinued") {
      throw new Error("Only enrolled students can be marked as discontinued.");
    }

    if (status === "enrolled") {
      if (!rollNumber) {
        rollNumber = await nextRollNumber(leads);
        assignedRollNumber = rollNumber;
      }
      if (!enrolledAt) {
        enrolledAt = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from("leads")
      .update({
        status,
        roll_number: rollNumber ?? null,
        enrolled_at: enrolledAt ?? null,
      })
      .eq("id", id)
      .select("id,name,email,phone,message,status,created_at,roll_number,enrolled_at")
      .single();

    if (error) throw error;
    window.dispatchEvent(new Event(EVENT));
    return { lead: fromRow(data as LeadRow), assignedRollNumber };
  },

  async updateDetails(id, input) {
    if (!supabase) return undefined;
    const updates: Record<string, string | null> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.phone !== undefined) updates.phone = input.phone || null;
    if (input.message !== undefined) updates.message = input.message;

    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select("id,name,email,phone,message,status,created_at,roll_number,enrolled_at")
      .single();

    if (error) throw error;
    window.dispatchEvent(new Event(EVENT));
    return fromRow(data as LeadRow);
  },

  async remove(id) {
    if (!supabase) return;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
    window.dispatchEvent(new Event(EVENT));
  },

  async findByEmail(email) {
    if (!supabase) return null;
    const needle = email.trim().toLowerCase();
    if (!needle) return null;
    const { data, error } = await supabase
      .from("leads")
      .select("id,name,email,phone,message,status,created_at,roll_number,enrolled_at")
      .ilike("email", needle)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ? fromRow(data as LeadRow) : null;
  },

  subscribe(cb) {
    const handler = () => cb();
    window.addEventListener(EVENT, handler);

    if (!supabase) {
      return () => window.removeEventListener(EVENT, handler);
    }

    const channel = supabase
      .channel("public:leads")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        handler,
      )
      .subscribe();

    return () => {
      window.removeEventListener(EVENT, handler);
      void supabase.removeChannel(channel);
    };
  },
};

const localLeadStore: LeadRepository = {
  async list() {
    return readLocal().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async add(input) {
    const lead: Lead = {
      ...input,
      id: crypto.randomUUID(),
      status: "new",
      createdAt: new Date().toISOString(),
    };
    writeLocal([lead, ...readLocal()]);
    return lead;
  },

  async importWithStatus(input) {
    assertImportStatus(input.status);
    const leads = readLocal();
    let assignedRollNumber: string | undefined;
    let rollNumber = input.rollNumber;
    let enrolledAt = input.enrolledAt;

    if (input.status === "enrolled") {
      if (!rollNumber) {
        rollNumber = await nextRollNumber(leads);
        assignedRollNumber = rollNumber;
      }
      if (!enrolledAt) {
        enrolledAt = new Date().toISOString();
      }
    }

    const lead: Lead = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      rollNumber,
      enrolledAt,
    };
    writeLocal([lead, ...leads]);
    return { lead, assignedRollNumber };
  },

  async updateStatus(id, status) {
    const leads = readLocal();
    const index = leads.findIndex((l) => l.id === id);
    if (index === -1) return {};

    const current = leads[index];
    let assignedRollNumber: string | undefined;
    let rollNumber = current.rollNumber;
    let enrolledAt = current.enrolledAt;

    if (status === "registered" && current.status !== "registered") {
      throw new Error("Registered status can only come from registration flow or bulk upload.");
    }

    if (status === "enrolled" && current.status !== "registered" && current.status !== "enrolled") {
      throw new Error("Only registered students can be marked as enrolled.");
    }

    if (status === "discontinued" && current.status !== "enrolled" && current.status !== "discontinued") {
      throw new Error("Only enrolled students can be marked as discontinued.");
    }

    if (status === "enrolled") {
      if (!rollNumber) {
        rollNumber = await nextRollNumber(leads);
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
    writeLocal(leads);
    return { lead: updated, assignedRollNumber };
  },

  async updateDetails(id, input) {
    const leads = readLocal();
    const index = leads.findIndex((l) => l.id === id);
    if (index === -1) return undefined;

    const updated: Lead = {
      ...leads[index],
      ...input,
    };
    leads[index] = updated;
    writeLocal(leads);
    return updated;
  },

  async remove(id) {
    writeLocal(readLocal().filter((l) => l.id !== id));
  },

  async findByEmail(email) {
    const needle = email.trim().toLowerCase();
    if (!needle) return null;
    return (
      readLocal()
        .filter((l) => l.email.trim().toLowerCase() === needle)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null
    );
  },

  subscribe(cb) {
    const handler = () => cb();
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  },
};

/** Default persistence: Supabase when configured, localStorage otherwise. */
export const leadsRepository: LeadRepository = supabase ? supabaseLeadStore : localLeadStore;

/** Backward-compatible facade */
export const leadsStore = leadsRepository;
