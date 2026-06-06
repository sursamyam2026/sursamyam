import { useCallback, useEffect, useState } from "react";
import {
  attendanceStore,
  type AttendanceRecord,
  type ClassRosterMember,
  type ClassSession,
} from "@/lib/attendance";

export function useAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [roster, setRoster] = useState<ClassRosterMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [nextRecords, nextSessions, nextRoster] = await Promise.all([
        attendanceStore.list(),
        attendanceStore.listSessions(),
        attendanceStore.listRoster(),
      ]);
      setRecords(nextRecords);
      setSessions(nextSessions);
      setRoster(nextRoster);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unable to load attendance."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    return attendanceStore.subscribe(() => {
      void refresh();
    });
  }, [refresh]);

  return { records, sessions, roster, isLoading, error, refresh };
}

export function useAttendanceBySession(sessionId: string | null) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [roster, setRoster] = useState<ClassRosterMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [nextRecords, nextRoster] = sessionId
        ? await Promise.all([
            attendanceStore.listBySession(sessionId),
            attendanceStore.listRosterBySession(sessionId),
          ])
        : [[], []];
      setRecords(nextRecords);
      setRoster(nextRoster);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unable to load attendance."));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    setIsLoading(true);
    void refresh();
    return attendanceStore.subscribe(() => {
      void refresh();
    });
  }, [sessionId, refresh]);

  return { records, roster, isLoading, error, refresh };
}
