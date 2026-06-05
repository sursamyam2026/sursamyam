import { useCallback, useEffect, useState } from "react";
import { attendanceStore, type AttendanceRecord, type ClassSession } from "@/lib/attendance";

export function useAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [nextRecords, nextSessions] = await Promise.all([
        attendanceStore.list(),
        attendanceStore.listSessions(),
      ]);
      setRecords(nextRecords);
      setSessions(nextSessions);
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

  return { records, sessions, isLoading, error, refresh };
}

export function useAttendanceBySession(sessionId: string | null) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setRecords(sessionId ? await attendanceStore.listBySession(sessionId) : []);
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

  return { records, isLoading, error, refresh };
}
