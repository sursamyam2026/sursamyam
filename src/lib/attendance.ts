import { supabase } from "@/lib/supabase";
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

const RECORDS_KEY = "swarshiksha:attendance";
const SESSIONS_KEY = "swarshiksha:class-sessions";
const ROSTER_KEY = "swarshiksha:class-roster";
const EVENT = "swarshiksha:attendance:changed";

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

function coerceSession(raw: unknown): ClassSession | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id : "";
  const classDate = typeof item.classDate === "string" ? item.classDate : "";
  const classDay = typeof item.classDay === "string" ? item.classDay : dayLabel(classDate);
  const classTime = typeof item.classTime === "string" ? item.classTime : "";
  const courseType = typeof item.courseType === "string" ? item.courseType : "";
  if (!id || !classDate || !classTime || !courseType) return null;
  return {
    id,
    classDate,
    classDay: classDay || dayLabel(classDate),
    classTime,
    courseType,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : new Date().toISOString(),
  };
}

function coerceRosterMember(raw: unknown): ClassRosterMember | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id : "";
  const sessionId = typeof item.sessionId === "string" ? item.sessionId : "";
  const leadId = typeof item.leadId === "string" ? item.leadId : "";
  if (!id || !sessionId || !leadId) return null;
  return {
    id,
    sessionId,
    leadId,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
  };
}

function coerceRecord(raw: unknown): AttendanceRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id : "";
  const sessionId = typeof item.sessionId === "string" ? item.sessionId : "";
  const leadId = typeof item.leadId === "string" ? item.leadId : "";
  const classDate = typeof item.classDate === "string" ? item.classDate : "";
  const status = item.status === "absent" ? "absent" : item.status === "present" ? "present" : null;
  if (!id || !sessionId || !leadId || !classDate || !status) return null;
  return {
    id,
    sessionId,
    leadId,
    classDate,
    status,
    notes: typeof item.notes === "string" ? item.notes : undefined,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : new Date().toISOString(),
  };
}

function readLocalSessions(): ClassSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(coerceSession).filter(Boolean) as ClassSession[];
  } catch {
    return [];
  }
}

function readLocalRoster(): ClassRosterMember[] {
  try {
    const raw = localStorage.getItem(ROSTER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(coerceRosterMember).filter(Boolean) as ClassRosterMember[];
  } catch {
    return [];
  }
}

function readLocalRecords(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(coerceRecord).filter(Boolean) as AttendanceRecord[];
  } catch {
    return [];
  }
}

function writeLocal(
  sessions: ClassSession[],
  records = readLocalRecords(),
  roster = readLocalRoster(),
) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
  window.dispatchEvent(new Event(EVENT));
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
    if (!supabase) return [];
    const { data, error } = await supabase
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
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("class_sessions")
      .select("id,class_date,class_day,class_time,course_type,created_at,updated_at")
      .order("class_date", { ascending: false })
      .order("class_time", { ascending: false });

    if (error) {
      if (isAttendanceSetupError(error)) return [];
      throw error;
    }
    return ((data ?? []) as SessionRow[]).map(fromSessionRow);
  },

  async listRosterBySession(sessionId) {
    if (!supabase) return [];
    const { data, error } = await supabase
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
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("class_roster")
      .select("id,session_id,lead_id,created_at");

    if (error) {
      if (isAttendanceSetupError(error)) return [];
      throw error;
    }
    return ((data ?? []) as RosterRow[]).map(fromRosterRow);
  },

  async listBySession(sessionId) {
    if (!supabase) return [];
    const { data, error } = await supabase
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
    if (!supabase) throw new Error("Supabase is not configured.");
    const now = new Date().toISOString();
    const { data: existingRows, error: existingError } = await supabase
      .from("class_sessions")
      .select("id,class_date,class_day,class_time,course_type,created_at,updated_at")
      .eq("class_date", input.classDate)
      .eq("class_time", input.classTime);

    if (existingError) {
      if (isAttendanceSetupError(existingError)) throw new Error(attendanceSetupMessage());
      throw existingError;
    }

    const existing = ((existingRows ?? []) as SessionRow[])[0];
    if (existing && existing.course_type !== input.courseType) {
      throw new Error(classTimeConflictMessage());
    }

    const query = existing
      ? supabase
          .from("class_sessions")
          .update({
            class_day: input.classDay,
            course_type: input.courseType,
            updated_at: now,
          })
          .eq("id", existing.id)
      : supabase
          .from("class_sessions")
          .insert({
            class_date: input.classDate,
            class_day: input.classDay,
            class_time: input.classTime,
            course_type: input.courseType,
            updated_at: now,
          });

    const { data, error } = await query
      .select("id,class_date,class_day,class_time,course_type,created_at,updated_at")
      .single();

    if (error) {
      if (isAttendanceSetupError(error)) throw new Error(attendanceSetupMessage());
      throw error;
    }
    window.dispatchEvent(new Event(EVENT));
    return fromSessionRow(data as SessionRow);
  },

  async saveRoster(sessionId, leadIds) {
    if (!supabase) return [];
    const { error: deleteError } = await supabase
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

    const { data, error } = await supabase
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
    if (!supabase || inputs.length === 0) return [];
    const now = new Date().toISOString();
    const { data, error } = await supabase
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
    if (!supabase) return;
    const { error } = await supabase
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

const localAttendanceStore: AttendanceRepository = {
  async list() {
    return readLocalRecords().sort((a, b) => b.classDate.localeCompare(a.classDate));
  },

  async listSessions() {
    return readLocalSessions().sort((a, b) => {
      const dateDiff = b.classDate.localeCompare(a.classDate);
      return dateDiff || b.classTime.localeCompare(a.classTime);
    });
  },

  async listBySession(sessionId) {
    return readLocalRecords().filter((record) => record.sessionId === sessionId);
  },

  async listRoster() {
    return readLocalRoster();
  },

  async listRosterBySession(sessionId) {
    return readLocalRoster().filter((member) => member.sessionId === sessionId);
  },

  async saveSession(input) {
    const now = new Date().toISOString();
    const sessions = readLocalSessions();
    const existing = sessions.find(
      (session) =>
        session.classDate === input.classDate &&
        session.classTime === input.classTime,
    );
    if (existing && existing.courseType !== input.courseType) {
      throw new Error(classTimeConflictMessage());
    }

    const saved: ClassSession = existing
      ? {
          ...existing,
          classDay: input.classDay,
          courseType: input.courseType,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          classDate: input.classDate,
          classDay: input.classDay,
          classTime: input.classTime,
          courseType: input.courseType,
          createdAt: now,
          updatedAt: now,
        };
    writeLocal([saved, ...sessions.filter((session) => session.id !== saved.id)]);
    return saved;
  },

  async saveRoster(sessionId, leadIds) {
    const now = new Date().toISOString();
    const sessions = readLocalSessions();
    const records = readLocalRecords();
    const roster = readLocalRoster();
    const saved = leadIds.map((leadId) => {
      const existing = roster.find(
        (member) => member.sessionId === sessionId && member.leadId === leadId,
      );
      return (
        existing ?? {
          id: crypto.randomUUID(),
          sessionId,
          leadId,
          createdAt: now,
        }
      );
    });
    writeLocal(
      sessions,
      records,
      [
        ...saved,
        ...roster.filter((member) => member.sessionId !== sessionId),
      ],
    );
    return saved;
  },

  async saveMany(inputs) {
    const now = new Date().toISOString();
    const sessions = readLocalSessions();
    const records = readLocalRecords();
    const sessionDates = new Map(sessions.map((session) => [session.id, session.classDate]));
    const saved = inputs.map((input) => {
      const existing = records.find(
        (record) => record.sessionId === input.sessionId && record.leadId === input.leadId,
      );
      const classDate = sessionDates.get(input.sessionId) ?? "";
      if (existing) {
        return {
          ...existing,
          status: input.status,
          notes: input.notes?.trim() || undefined,
          updatedAt: now,
        };
      }
      return {
        id: crypto.randomUUID(),
        sessionId: input.sessionId,
        leadId: input.leadId,
        classDate,
        status: input.status,
        notes: input.notes?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };
    });

    const savedKeys = new Set(saved.map((record) => `${record.sessionId}:${record.leadId}`));
    writeLocal(sessions, [
      ...saved,
      ...records.filter((record) => !savedKeys.has(`${record.sessionId}:${record.leadId}`)),
    ]);
    return saved;
  },

  async removeSession(sessionId) {
    const sessions = readLocalSessions().filter((session) => session.id !== sessionId);
    const records = readLocalRecords().filter((record) => record.sessionId !== sessionId);
    const roster = readLocalRoster().filter((member) => member.sessionId !== sessionId);
    writeLocal(sessions, records, roster);
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

export const attendanceStore: AttendanceRepository = supabase
  ? supabaseAttendanceStore
  : localAttendanceStore;
