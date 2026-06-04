import { supabase } from "@/lib/supabase";
import type { ExamRegistration } from "@/lib/exam-registrations.types";

export type { ExamRegistration };

interface ExamRegistrationRow {
  id: string;
  roll_number: string;
  created_at: string;
}

const KEY = "swarshiksha:exam-registrations";
const EVENT = "swarshiksha:exam-registrations:changed";

function notifyExamRegistrationsChanged() {
  window.dispatchEvent(new Event(EVENT));
}

function normalizeRollNumber(rollNumber: string) {
  return rollNumber.trim().toLowerCase();
}

function coerceRegistration(raw: unknown): ExamRegistration | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : "";
  const rollNumber = typeof o.rollNumber === "string" ? o.rollNumber : "";
  if (!id || !rollNumber) return null;

  return {
    id,
    rollNumber,
    createdAt: typeof o.createdAt === "string" ? o.createdAt : new Date().toISOString(),
  };
}

function fromRow(row: ExamRegistrationRow): ExamRegistration {
  return {
    id: row.id,
    rollNumber: row.roll_number,
    createdAt: row.created_at,
  };
}

function maybeFromRow(row: unknown): ExamRegistration | null {
  if (!row || typeof row !== "object") return null;
  const item = row as Partial<ExamRegistrationRow>;
  if (!item.id || !item.roll_number || !item.created_at) return null;
  return fromRow(item as ExamRegistrationRow);
}

function read(): ExamRegistration[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(coerceRegistration).filter(Boolean) as ExamRegistration[];
  } catch {
    return [];
  }
}

function write(registrations: ExamRegistration[]) {
  localStorage.setItem(KEY, JSON.stringify(registrations));
  notifyExamRegistrationsChanged();
}

export const examRegistrationsStore = {
  async list(): Promise<ExamRegistration[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("exam_registrations")
        .select("id,roll_number,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as ExamRegistrationRow[]).map(fromRow);
    }

    return read().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async findByRollNumber(rollNumber: string): Promise<ExamRegistration | null> {
    const needle = normalizeRollNumber(rollNumber);
    if (!needle) return null;

    if (supabase) {
      const { data, error } = await supabase.rpc("find_exam_registration", {
        p_roll_number: rollNumber,
      }).maybeSingle();
      if (error) throw error;
      return maybeFromRow(data);
    }

    return (
      read().find(
        (registration) => normalizeRollNumber(registration.rollNumber) === needle,
      ) ?? null
    );
  },

  async add(rollNumber: string): Promise<ExamRegistration | null> {
    if (supabase) {
      const { data, error } = await supabase.rpc("submit_exam_registration", {
        p_roll_number: rollNumber,
      }).maybeSingle();
      if (error) throw error;
      notifyExamRegistrationsChanged();
      return maybeFromRow(data);
    }

    if (await this.findByRollNumber(rollNumber)) return null;
    const registration: ExamRegistration = {
      id: crypto.randomUUID(),
      rollNumber: rollNumber.trim(),
      createdAt: new Date().toISOString(),
    };
    write([registration, ...read()]);
    return registration;
  },

  async remove(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from("exam_registrations").delete().eq("id", id);
      if (error) throw error;
      notifyExamRegistrationsChanged();
      return;
    }

    write(read().filter((registration) => registration.id !== id));
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(EVENT, handler);

    if (supabase) {
      const channel = supabase
        .channel("public:exam_registrations")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "exam_registrations" },
          handler,
        )
        .subscribe();

      return () => {
        window.removeEventListener(EVENT, handler);
        void supabase.removeChannel(channel);
      };
    }

    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  },
};
