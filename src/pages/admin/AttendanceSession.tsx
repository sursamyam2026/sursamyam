import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarCheck, CheckCircle2, Save, UserPlus, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAttendance, useAttendanceBySession } from "@/hooks/use-attendance";
import { useLeads } from "@/hooks/use-leads";
import { attendanceStore, type AttendanceStatus } from "@/lib/attendance";
import { useToast } from "@/hooks/use-toast";

type DraftRecord = {
  status: AttendanceStatus;
  notes: string;
};

function ordinal(day: number) {
  if (day > 10 && day < 20) return "th";
  const lastDigit = day % 10;
  if (lastDigit === 1) return "st";
  if (lastDigit === 2) return "nd";
  if (lastDigit === 3) return "rd";
  return "th";
}

function displayDate(date: string) {
  if (!date) return "-";
  const value = new Date(`${date}T00:00:00`);
  const day = value.getDate();
  const month = value.toLocaleDateString(undefined, { month: "long" });
  return `${day}${ordinal(day)} ${month} ${value.getFullYear()}`;
}

function dayLabel(date: string) {
  if (!date) return "-";
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: "long" });
}

function formatTime(time: string) {
  if (!time) return "-";
  const [hourText, minute = "00"] = time.split(":");
  const hour = Number.parseInt(hourText, 10);
  if (Number.isNaN(hour)) return time;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.padStart(2, "0")} ${period}`;
}

function monthKey(date: string) {
  return date.slice(0, 7);
}

const AttendanceSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, DraftRecord>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { leads, isLoading: isLoadingLeads, error: leadsError } = useLeads();
  const {
    records: allAttendanceRecords,
    sessions,
    isLoading: isLoadingAttendance,
    error: attendanceError,
    refresh: refreshAttendance,
  } = useAttendance();
  const {
    records: sessionRecords,
    roster: sessionRoster,
    isLoading: isLoadingSessionAttendance,
    error: sessionAttendanceError,
    refresh: refreshSessionAttendance,
  } = useAttendanceBySession(sessionId ?? null);

  const selectedSession = sessions.find((session) => session.id === sessionId) ?? null;
  const enrolledStudents = useMemo(
    () => leads.filter((lead) => lead.status === "enrolled"),
    [leads],
  );
  const sessionRosterIds = useMemo(
    () => sessionRoster.map((member) => member.leadId),
    [sessionRoster],
  );
  const classStudents = useMemo(
    () => enrolledStudents.filter((student) => sessionRosterIds.includes(student.id)),
    [enrolledStudents, sessionRosterIds],
  );

  useEffect(() => {
    const nextDrafts: Record<string, DraftRecord> = {};
    classStudents.forEach((student) => {
      const record = sessionRecords.find((item) => item.leadId === student.id);
      nextDrafts[student.id] = {
        status: record?.status ?? "present",
        notes: record?.notes ?? "",
      };
    });
    setDrafts(nextDrafts);
  }, [classStudents, sessionRecords]);

  const savedMonthlyMissedByStudent = useMemo(() => {
    const missed = new Map<string, number>();
    allAttendanceRecords.forEach((record) => {
      if (
        !selectedSession ||
        monthKey(record.classDate) !== monthKey(selectedSession.classDate) ||
        record.sessionId === selectedSession.id ||
        record.status !== "absent"
      ) {
        return;
      }
      missed.set(record.leadId, (missed.get(record.leadId) ?? 0) + 1);
    });
    return missed;
  }, [allAttendanceRecords, selectedSession]);

  const presentCount = classStudents.filter(
    (student) => drafts[student.id]?.status === "present",
  ).length;
  const absentCount = Math.max(classStudents.length - presentCount, 0);
  const attendanceRate =
    classStudents.length === 0
      ? 0
      : Math.round((presentCount / classStudents.length) * 100);
  const pageError = leadsError || attendanceError || sessionAttendanceError;
  const isLoading = isLoadingLeads || isLoadingAttendance || isLoadingSessionAttendance;

  const updateDraft = (leadId: string, patch: Partial<DraftRecord>) => {
    setDrafts((current) => ({
      ...current,
      [leadId]: {
        status: current[leadId]?.status ?? "present",
        notes: current[leadId]?.notes ?? "",
        ...patch,
      },
    }));
  };

  const markAll = (status: AttendanceStatus) => {
    const nextDrafts: Record<string, DraftRecord> = {};
    classStudents.forEach((student) => {
      nextDrafts[student.id] = {
        status,
        notes: drafts[student.id]?.notes ?? "",
      };
    });
    setDrafts(nextDrafts);
  };

  const saveAttendance = async () => {
    if (!selectedSession) return;
    setIsSaving(true);
    try {
      await attendanceStore.saveMany(
        classStudents.map((student) => ({
          sessionId: selectedSession.id,
          leadId: student.id,
          status: drafts[student.id]?.status ?? "present",
          notes: drafts[student.id]?.notes,
        })),
      );
      await Promise.all([refreshAttendance(), refreshSessionAttendance()]);
      toast({
        title: "Attendance saved",
        description: `${classStudents.length} ${classStudents.length === 1 ? "student" : "students"} updated for ${selectedSession.courseType}.`,
      });
    } catch (err) {
      toast({
        title: "Unable to save attendance",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const stats = [
    { label: "Class Students", value: classStudents.length, icon: UserPlus, color: "text-gold" },
    { label: "Present", value: presentCount, icon: CheckCircle2, color: "text-green-700" },
    { label: "Absent", value: absentCount, icon: XCircle, color: "text-orange-700" },
    { label: "Attendance Rate", value: `${attendanceRate}%`, icon: CalendarCheck, color: "text-primary" },
  ];

  if (isLoading) {
    return (
      <Card variant="default" className="p-8 text-center text-muted-foreground">
        <p className="font-medium text-foreground">Loading class...</p>
      </Card>
    );
  }

  if (pageError || !selectedSession) {
    return (
      <Card variant="default" className="p-10 text-center text-muted-foreground">
        <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="font-medium text-foreground">Class not found</p>
        <p className="text-sm mt-1">Return to the attendance schedule and choose a class.</p>
        <Button type="button" className="mt-4" onClick={() => navigate("/admin/attendance")}>
          Back to Classes
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button type="button" variant="ghost" className="mb-2 px-0" asChild>
            <Link to="/admin/attendance">
              <ArrowLeft className="w-4 h-4" />
              Classes
            </Link>
          </Button>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">
            {selectedSession.courseType}
          </h1>
          <p className="text-muted-foreground mt-1">
            {displayDate(selectedSession.classDate)} · {selectedSession.classDay || dayLabel(selectedSession.classDate)} · {formatTime(selectedSession.classTime)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Batch: {selectedSession.batch || "All batches"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => markAll("present")}>
            Mark all present
          </Button>
          <Button type="button" variant="outline" onClick={() => markAll("absent")}>
            Mark all absent
          </Button>
          <Button type="button" onClick={saveAttendance} disabled={isSaving || classStudents.length === 0}>
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} variant="elevated" className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="font-display text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card variant="default" className="p-0 overflow-hidden">
        {classStudents.length === 0 ? (
          <div className="text-center py-16 px-4 text-muted-foreground">
            <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-foreground">No students in this class</p>
            <p className="text-sm mt-1">No enrolled students match this class type and format.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Missed This Month</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-[220px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classStudents.map((student) => {
                  const draft = drafts[student.id] ?? { status: "present", notes: "" };
                  const isPresent = draft.status === "present";
                  const missedThisMonth =
                    (savedMonthlyMissedByStudent.get(student.id) ?? 0) + (isPresent ? 0 : 1);

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="min-w-[180px]">
                        <p className="break-words font-medium">{student.name}</p>
                        <p className="break-all text-sm text-muted-foreground">{student.email}</p>
                      </TableCell>
                      <TableCell className="font-semibold text-[#7A8C7E]">
                        {student.rollNumber || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={missedThisMonth > 0 ? "bg-orange-500/15 text-orange-700" : "bg-green-500/15 text-green-700"}>
                          {missedThisMonth}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-3">
                          <Checkbox
                            checked={isPresent}
                            onCheckedChange={(checked) =>
                              updateDraft(student.id, {
                                status: checked ? "present" : "absent",
                              })
                            }
                            aria-label={`Mark ${student.name} present`}
                          />
                          <Badge
                            className={
                              `whitespace-normal text-center leading-tight ${
                                isPresent
                                  ? "bg-green-500/15 text-green-700 dark:text-green-400"
                                  : "bg-orange-500/15 text-orange-700 dark:text-orange-400"
                              }`
                            }
                          >
                            {isPresent ? "Present" : "Absent"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={draft.notes}
                          onChange={(event) => updateDraft(student.id, { notes: event.target.value })}
                          placeholder="Optional note"
                          className="min-h-[42px]"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AttendanceSession;
