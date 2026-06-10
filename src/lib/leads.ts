// Lead persistence. Supabase is required for business data.

import { requireSupabase, supabase } from "@/lib/supabase";
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

const EVENT = "sursamyam:leads:changed";
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

function assertImportStatus(status: LeadStatus) {
  if (status !== "registered" && status !== "enrolled") {
    throw new Error("Bulk upload can only import registered or enrolled students.");
  }
}

function assertStatusTransition(currentStatus: LeadStatus, nextStatus: LeadStatus) {
  if (currentStatus === "registered" && nextStatus !== "registered" && nextStatus !== "enrolled" && nextStatus !== "declined") {
    throw new Error("Registered students can only be enrolled or declined.");
  }

  if (currentStatus === "enrolled" && nextStatus !== "enrolled" && nextStatus !== "registered" && nextStatus !== "discontinued") {
    throw new Error("Enrolled students can only be registered or discontinued.");
  }

  if (currentStatus === "discontinued" && nextStatus !== "discontinued" && nextStatus !== "enrolled") {
    throw new Error("Discontinued students can only be re-enrolled.");
  }

  if (nextStatus === "registered" && currentStatus !== "registered" && currentStatus !== "enrolled") {
    throw new Error("Registered status can only come from registration flow or bulk upload.");
  }

  if (nextStatus === "enrolled" && currentStatus !== "registered" && currentStatus !== "enrolled" && currentStatus !== "discontinued") {
    throw new Error("Only registered or discontinued students can be marked as enrolled.");
  }

  if (nextStatus === "discontinued" && currentStatus !== "enrolled" && currentStatus !== "discontinued") {
    throw new Error("Only enrolled students can be marked as discontinued.");
  }
}

function getMaxAssignedForYear(leads: Lead[], year: string): number {
  return leads.reduce((max, lead) => {
    const match = lead.rollNumber?.match(/^SS-(\d{4})-(\d{3})$/);
    if (!match || match[1] !== year) return max;
    return Math.max(max, Number.parseInt(match[2], 10));
  }, 0);
}

async function readSupabaseRollMeta(): Promise<RollMeta> {
  const db = requireSupabase();
  const { data, error } = await db
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
  const db = requireSupabase();
  const { error } = await db
    .from("roll_meta")
    .upsert({ id: 1, yearly_counters: meta.yearlyCounters });
  if (error) throw error;
}

async function nextRollNumber(leads: Lead[], assignedAt = new Date()): Promise<string> {
  const year = String(assignedAt.getFullYear());
  const meta = await readSupabaseRollMeta();
  const currentCounter = meta.yearlyCounters[year] ?? 0;
  const maxFromData = getMaxAssignedForYear(leads, year);
  const nextCounter = Math.max(currentCounter, maxFromData) + 1;
  meta.yearlyCounters[year] = nextCounter;

  await writeSupabaseRollMeta(meta);

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

  const db = requireSupabase();
  const { error } = await db.rpc("finalize_enrollment_lead", {
    p_email: needle,
    p_name: input.name.trim(),
    p_phone: input.phone.trim() || null,
    p_note: note,
  });

  if (error) throw error;
  window.dispatchEvent(new Event(EVENT));
}

const supabaseLeadStore: LeadRepository = {
  async list() {
    const db = requireSupabase();
    const { data, error } = await db
      .from("leads")
      .select("id,name,email,phone,message,status,created_at,roll_number,enrolled_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return ((data ?? []) as LeadRow[]).map(fromRow);
  },

  async add(input) {
    const db = requireSupabase();
    const { data, error } = await db.rpc("submit_contact_lead", {
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
    const db = requireSupabase();
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

    const { data, error } = await db
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
    const db = requireSupabase();
    const leads = await this.list();
    const current = leads.find((l) => l.id === id);
    if (!current) return {};

    let assignedRollNumber: string | undefined;
    let rollNumber = current.rollNumber;
    let enrolledAt = current.enrolledAt;

    assertStatusTransition(current.status, status);

    if (status === "registered") {
      rollNumber = undefined;
      enrolledAt = undefined;
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

    const { data, error } = await db
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
    const db = requireSupabase();
    const updates: Record<string, string | null> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.phone !== undefined) updates.phone = input.phone || null;
    if (input.message !== undefined) updates.message = input.message;

    const { data, error } = await db
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
    const db = requireSupabase();
    const { error } = await db.from("leads").delete().eq("id", id);
    if (error) throw error;
    window.dispatchEvent(new Event(EVENT));
  },

  async findByEmail(email) {
    const db = requireSupabase();
    const needle = email.trim().toLowerCase();
    if (!needle) return null;
    const { data, error } = await db
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

    if (!supabase) return () => window.removeEventListener(EVENT, handler);

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

export const leadsRepository: LeadRepository = supabaseLeadStore;

/** Backward-compatible facade */
export const leadsStore = leadsRepository;
