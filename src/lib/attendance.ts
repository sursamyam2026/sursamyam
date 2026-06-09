import { requireSupabase, supabase } from "@/lib/supabase";
import type {
  AttendanceInput,
  AttendanceRecord,
  ClassRosterMember,
  ClassSession,
  ClassSessionInput,
} from "@/lib/attendance.types";

export type {
  AttendanceInput,
  AttendanceRecord,
  AttendanceStatus,
  ClassRosterMember,
  ClassSession,
  ClassSessionInput,
} from "@/lib/attendance.types";

interface SessionRow {
  id: string;
  class_date: string;
  class_day: string;
  class_time: string;
  course_type: string;
  batch: string | null;
  created_at: string;
  updated_at: string;
}

interface RosterRow {
  id: string;
  session_id: string;
  lead_id: string;
  created_at: string;
}

interface AttendanceRow {
  id: string;
  session_id: string;
  lead_id: string;
  status: "present" | "absent";
  notes: string | null;
  created_at: string;
  updated_at: string;
  class_sessions?: { class_date: string } | null;
}

const EVENT = "sursamyam:attendance:changed";

function uniqueChannelName(name: string): string {
  return `${name}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

function isAttendanceSetupError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const item = error as { code?: string; message?: string };
  const message = item.message ?? "";
  return (
    item.code === "42P01" ||
    item.code === "42703" ||
    item.code === "PGRST200" ||
    item.code === "PGRST205" ||
    message.includes("class_sessions") ||
    message.includes("attendance_records") ||
    message.includes("Could not find")
  );
}

function attendanceSetupMessage() {
  return "Attendance tables are not set up yet. Run supabase/attendance.sql in Supabase SQL Editor.";
}

function classTimeConflictMessage() {
  return "Another class is already scheduled at this date and time.";
}

function dayLabel(date: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: "long" });
}

function fromSessionRow(row: SessionRow): ClassSession {
  return {
    id: row.id,
    classDate: row.class_date,
    classDay: row.class_day || dayLabel(row.class_date),
    classTime: row.class_time,
    courseType: row.course_type,
    batch: row.batch ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fromRosterRow(row: RosterRow): ClassRosterMember {
  return {
    id: row.id,
    sessionId: row.session_id,
    leadId: row.lead_id,
    createdAt: row.created_at,
  };
}

function fromAttendanceRow(row: AttendanceRow, sessionDate = ""): AttendanceRecord {
  return {
    id: row.id,
    sessionId: row.session_id,
    leadId: row.lead_id,
    classDate: row.class_sessions?.class_date ?? sessionDate,
    status: row.status,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface AttendanceRepository {
  list(): Promise<AttendanceRecord[]>;
  listSessions(): Promise<ClassSession[]>;
  listRoster(): Promise<ClassRosterMember[]>;
  listRosterBySession(sessionId: string): Promise<ClassRosterMember[]>;
  listBySession(sessionId: string): Promise<AttendanceRecord[]>;
  saveSession(input: ClassSessionInput): Promise<ClassSession>;
  saveRoster(sessionId: string, leadIds: string[]): Promise<ClassRosterMember[]>;
  saveMany(inputs: AttendanceInput[]): Promise<AttendanceRecord[]>;
  removeSession(sessionId: string): Promise<void>;
  subscribe(cb: () => void): () => void;
}

const supabaseAttendanceStore: AttendanceRepository = {
  async list() {
    const db = requireSupabase();
    const { data, error } = await db
      .from("attendance_records")
      .select("id,session_id,lead_id,status,notes,created_at,updated_at,class_sessions(class_date)")
      .order("created_at", { ascending: false });

    if (error) {
      if (isAttendanceSetupError(error)) return [];
      throw error;
    }
    return ((data ?? []) as AttendanceRow[]).map((row) => fromAttendanceRow(row));
  },

  async listSessions() {
    const db = requireSupabase();
    const { data, error } = await db
      .from("class_sessions")
      .select("id,class_date,class_day,class_time,course_type,batch,created_at,updated_at")
      .order("class_date", { ascending: false })
      .order("class_time", { ascending: false });

    if (error) {
      if (isAttendanceSetupError(error)) return [];
      throw error;
    }
    return ((data ?? []) as SessionRow[]).map(fromSessionRow);
  },

  async listRosterBySession(sessionId) {
    const db = requireSupabase();
    const { data, error } = await db
      .from("class_roster")
      .select("id,session_id,lead_id,created_at")
      .eq("session_id", sessionId);

    if (error) {
      if (isAttendanceSetupError(error)) return [];
      throw error;
    }
    return ((data ?? []) as RosterRow[]).map(fromRosterRow);
  },

  async listRoster() {
    const db = requireSupabase();
    const { data, error } = await db
      .from("class_roster")
      .select("id,session_id,lead_id,created_at");

    if (error) {
      if (isAttendanceSetupError(error)) return [];
      throw error;
    }
    return ((data ?? []) as RosterRow[]).map(fromRosterRow);
  },

  async listBySession(sessionId) {
    const db = requireSupabase();
    const { data, error } = await db
      .from("attendance_records")
      .select("id,session_id,lead_id,status,notes,created_at,updated_at,class_sessions(class_date)")
      .eq("session_id", sessionId);

    if (error) {
      if (isAttendanceSetupError(error)) return [];
      throw error;
    }
    return ((data ?? []) as AttendanceRow[]).map((row) => fromAttendanceRow(row));
  },

  async saveSession(input) {
    const db = requireSupabase();
    const now = new Date().toISOString();
    const { data: existingRows, error: existingError } = await db
      .from("class_sessions")
      .select("id,class_date,class_day,class_time,course_type,batch,created_at,updated_at")
      .eq("class_date", input.classDate)
      .eq("class_time", input.classTime);

    if (existingError) {
      if (isAttendanceSetupError(existingError)) throw new Error(attendanceSetupMessage());
      throw existingError;
    }

    const existing = ((existingRows ?? []) as SessionRow[]).find((row) => row.id !== input.id);
    if (existing) {
      throw new Error(classTimeConflictMessage());
    }

    const query = input.id
      ? db
          .from("class_sessions")
          .update({
            class_date: input.classDate,
            class_day: input.classDay,
            class_time: input.classTime,
            course_type: input.courseType,
            batch: input.batch?.trim() || null,
            updated_at: now,
          })
          .eq("id", input.id)
      : db
          .from("class_sessions")
          .insert({
            class_date: input.classDate,
            class_day: input.classDay,
            class_time: input.classTime,
            course_type: input.courseType,
            batch: input.batch?.trim() || null,
            updated_at: now,
          });

    const { data, error } = await query
      .select("id,class_date,class_day,class_time,course_type,batch,created_at,updated_at")
      .single();

    if (error) {
      if (isAttendanceSetupError(error)) throw new Error(attendanceSetupMessage());
      throw error;
    }
    window.dispatchEvent(new Event(EVENT));
    return fromSessionRow(data as SessionRow);
  },

  async saveRoster(sessionId, leadIds) {
    const db = requireSupabase();
    const { error: deleteError } = await db
      .from("class_roster")
      .delete()
      .eq("session_id", sessionId);

    if (deleteError) {
      if (isAttendanceSetupError(deleteError)) throw new Error(attendanceSetupMessage());
      throw deleteError;
    }

    if (leadIds.length === 0) {
      window.dispatchEvent(new Event(EVENT));
      return [];
    }

    const { data, error } = await db
      .from("class_roster")
      .insert(leadIds.map((leadId) => ({ session_id: sessionId, lead_id: leadId })))
      .select("id,session_id,lead_id,created_at");

    if (error) {
      if (isAttendanceSetupError(error)) throw new Error(attendanceSetupMessage());
      throw error;
    }
    window.dispatchEvent(new Event(EVENT));
    return ((data ?? []) as RosterRow[]).map(fromRosterRow);
  },

  async saveMany(inputs) {
    const db = requireSupabase();
    if (inputs.length === 0) return [];
    const now = new Date().toISOString();
    const { data, error } = await db
      .from("attendance_records")
      .upsert(
        inputs.map((input) => ({
          session_id: input.sessionId,
          lead_id: input.leadId,
          status: input.status,
          notes: input.notes?.trim() || null,
          updated_at: now,
        })),
        { onConflict: "session_id,lead_id" },
      )
      .select("id,session_id,lead_id,status,notes,created_at,updated_at,class_sessions(class_date)");

    if (error) {
      if (isAttendanceSetupError(error)) throw new Error(attendanceSetupMessage());
      throw error;
    }
    window.dispatchEvent(new Event(EVENT));
    return ((data ?? []) as AttendanceRow[]).map((row) => fromAttendanceRow(row));
  },

  async removeSession(sessionId) {
    const db = requireSupabase();
    const { error } = await db
      .from("class_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      if (isAttendanceSetupError(error)) throw new Error(attendanceSetupMessage());
      throw error;
    }
    window.dispatchEvent(new Event(EVENT));
  },

  subscribe(cb) {
    const handler = () => cb();
    window.addEventListener(EVENT, handler);
    if (!supabase) return () => window.removeEventListener(EVENT, handler);

    const recordsChannel = supabase
      .channel(uniqueChannelName("public:attendance_records"))
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_records" }, handler)
      .subscribe();
    const rosterChannel = supabase
      .channel(uniqueChannelName("public:class_roster"))
      .on("postgres_changes", { event: "*", schema: "public", table: "class_roster" }, handler)
      .subscribe();
    const sessionsChannel = supabase
      .channel(uniqueChannelName("public:class_sessions"))
      .on("postgres_changes", { event: "*", schema: "public", table: "class_sessions" }, handler)
      .subscribe();

    return () => {
      window.removeEventListener(EVENT, handler);
      void supabase.removeChannel(recordsChannel);
      void supabase.removeChannel(rosterChannel);
      void supabase.removeChannel(sessionsChannel);
    };
  },
};

export const attendanceStore: AttendanceRepository = supabaseAttendanceStore;
