import { requireSupabase, supabase } from "@/lib/supabase";
import type { ExamRegistration } from "@/lib/exam-registrations.types";

export type { ExamRegistration };

interface ExamRegistrationRow {
  id: string;
  roll_number: string;
  created_at: string;
}

const EVENT = "sursamyam:exam-registrations:changed";

function notifyExamRegistrationsChanged() {
  window.dispatchEvent(new Event(EVENT));
}

function normalizeRollNumber(rollNumber: string) {
  return rollNumber.trim().toLowerCase();
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

export const examRegistrationsStore = {
  async list(): Promise<ExamRegistration[]> {
    const db = requireSupabase();
    const { data, error } = await db
      .from("exam_registrations")
      .select("id,roll_number,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as ExamRegistrationRow[]).map(fromRow);
  },

  async findByRollNumber(rollNumber: string): Promise<ExamRegistration | null> {
    const needle = normalizeRollNumber(rollNumber);
    if (!needle) return null;

    const db = requireSupabase();
    const { data, error } = await db.rpc("find_exam_registration", {
      p_roll_number: rollNumber,
    }).maybeSingle();
    if (error) throw error;
    return maybeFromRow(data);
  },

  async add(rollNumber: string): Promise<ExamRegistration | null> {
    const db = requireSupabase();
    const { data, error } = await db.rpc("submit_exam_registration", {
      p_roll_number: rollNumber,
    }).maybeSingle();
    if (error) throw error;
    notifyExamRegistrationsChanged();
    return maybeFromRow(data);
  },

  async remove(id: string): Promise<void> {
    const db = requireSupabase();
    const { error } = await db.from("exam_registrations").delete().eq("id", id);
    if (error) throw error;
    notifyExamRegistrationsChanged();
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(EVENT, handler);

    if (!supabase) return () => window.removeEventListener(EVENT, handler);

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
  },
};
