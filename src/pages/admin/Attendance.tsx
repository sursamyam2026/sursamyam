import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, CheckCircle2, Save, Users, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAttendance, useAttendanceBySession } from "@/hooks/use-attendance";
import { useLeads } from "@/hooks/use-leads";
import { attendanceStore, type AttendanceStatus } from "@/lib/attendance";
import { useToast } from "@/hooks/use-toast";

type DraftRecord = {
  status: AttendanceStatus;
  notes: string;
};

const COURSE_TYPES = [
  "Adults - One-on-One",
  "Adults - Group",
  "Kids - One-on-One",
  "Kids - Group",
  "Exam Prep",
  "Trial Class",
];

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayLabel(date: string) {
  if (!date) return "-";
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: "long" });
}

function monthKey(date: string) {
  return date.slice(0, 7);
}

const Attendance = () => {
  const [classDate, setClassDate] = useState(todayString());
  const [classTime, setClassTime] = useState("17:00");
  const [courseType, setCourseType] = useState(COURSE_TYPES[0]);
  const [drafts, setDrafts] = useState<Record<string, DraftRecord>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { leads, isLoading: isLoadingLeads, error: leadsError } = useLeads();
  const {
    records: allAttendanceRecords,
    sessions,
    isLoading: isLoadingAllAttendance,
    error: allAttendanceError,
    refresh: refreshAllAttendance,
  } = useAttendance();
  const currentSession = sessions.find(
    (session) =>
      session.classDate === classDate &&
      session.classTime === classTime &&
      session.courseType === courseType,
  );
  const {
    records: sessionRecords,
    isLoading: isLoadingSessionAttendance,
    error: sessionAttendanceError,
    refresh: refreshSessionAttendance,
  } = useAttendanceBySession(currentSession?.id ?? null);
  const { toast } = useToast();

  const enrolledStudents = useMemo(
    () => leads.filter((lead) => lead.status === "enrolled"),
    [leads],
  );

  useEffect(() => {
    const nextDrafts: Record<string, DraftRecord> = {};
    enrolledStudents.forEach((student) => {
      const record = sessionRecords.find((item) => item.leadId === student.id);
      nextDrafts[student.id] = {
        status: record?.status ?? "present",
        notes: record?.notes ?? "",
      };
    });
    setDrafts(nextDrafts);
  }, [enrolledStudents, sessionRecords]);

  const savedMonthlyMissedByStudent = useMemo(() => {
    const missed = new Map<string, number>();
    allAttendanceRecords.forEach((record) => {
      if (
        monthKey(record.classDate) !== monthKey(classDate) ||
        record.sessionId === currentSession?.id ||
        record.status !== "absent"
      ) {
        return;
      }
      missed.set(record.leadId, (missed.get(record.leadId) ?? 0) + 1);
    });
    return missed;
  }, [allAttendanceRecords, classDate, currentSession?.id]);

  const sessionsThisMonth = sessions.filter((session) => monthKey(session.classDate) === monthKey(classDate));
  const sessionCountThisMonth = currentSession
    ? sessionsThisMonth.length
    : sessionsThisMonth.length + 1;
  const presentCount = enrolledStudents.filter(
    (student) => drafts[student.id]?.status === "present",
  ).length;
  const absentCount = Math.max(enrolledStudents.length - presentCount, 0);
  const attendanceRate =
    enrolledStudents.length === 0
      ? 0
      : Math.round((presentCount / enrolledStudents.length) * 100);
  const pageError = leadsError || allAttendanceError || sessionAttendanceError;
  const isLoading = isLoadingLeads || isLoadingAllAttendance || isLoadingSessionAttendance;

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
    enrolledStudents.forEach((student) => {
      nextDrafts[student.id] = {
        status,
        notes: drafts[student.id]?.notes ?? "",
      };
    });
    setDrafts(nextDrafts);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const session = await attendanceStore.saveSession({ classDate, classTime, courseType });
      await attendanceStore.saveMany(
        enrolledStudents.map((student) => ({
          sessionId: session.id,
          leadId: student.id,
          status: drafts[student.id]?.status ?? "present",
          notes: drafts[student.id]?.notes,
        })),
      );
      await Promise.all([refreshAllAttendance(), refreshSessionAttendance()]);
      toast({
        title: "Attendance saved",
        description: `${courseType} on ${classDate} at ${classTime} was updated.`,
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
    { label: "Enrolled Students", value: enrolledStudents.length, icon: Users, color: "text-primary" },
    { label: "Present", value: presentCount, icon: CheckCircle2, color: "text-green-700" },
    { label: "Absent", value: absentCount, icon: XCircle, color: "text-orange-700" },
    { label: "This Month Sessions", value: sessionCountThisMonth, icon: CalendarCheck, color: "text-gold" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Attendance Calendar</h1>
          <p className="text-muted-foreground mt-1">
            {pageError ? "Unable to load attendance." : "Track attendance by class session."}
          </p>
        </div>
        <Button type="button" onClick={handleSave} disabled={isSaving || enrolledStudents.length === 0}>
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Attendance"}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card variant="default" className="p-5">
          <h2 className="font-display text-lg font-semibold mb-4">Class Session</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Date</p>
              <Input type="date" value={classDate} onChange={(event) => setClassDate(event.target.value)} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Day</p>
              <Input value={dayLabel(classDate)} disabled />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Time</p>
              <Input type="time" value={classTime} onChange={(event) => setClassTime(event.target.value)} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Course Type</p>
              <Select value={courseType} onValueChange={setCourseType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-[#1B4D3E]">
                  {COURSE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card variant="default" className="p-5">
          <h2 className="font-display text-lg font-semibold mb-3">Month Overview</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Month</span>
              <span className="font-medium">{monthKey(classDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Classes scheduled</span>
              <span className="font-medium">{sessionCountThisMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current session rate</span>
              <span className="font-medium">{attendanceRate}%</span>
            </div>
          </div>
        </Card>
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
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Roster</h2>
            <p className="text-sm text-muted-foreground">
              {dayLabel(classDate)} · {classTime} · {courseType}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => markAll("present")}>
              Mark all present
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => markAll("absent")}>
              Mark all absent
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 px-4 text-muted-foreground">
            <p className="font-medium text-foreground">Loading attendance...</p>
          </div>
        ) : enrolledStudents.length === 0 ? (
          <div className="text-center py-16 px-4 text-muted-foreground">
            <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-foreground">No enrolled students</p>
            <p className="text-sm mt-1">Students marked as enrolled will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date / Day</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Missed This Month</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-[220px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrolledStudents.map((student) => {
                  const draft = drafts[student.id] ?? { status: "present", notes: "" };
                  const isPresent = draft.status === "present";
                  const missedThisMonth =
                    (savedMonthlyMissedByStudent.get(student.id) ?? 0) + (isPresent ? 0 : 1);

                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <p className="font-medium">{classDate}</p>
                        <p className="text-sm text-muted-foreground">{dayLabel(classDate)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{classTime}</p>
                        <p className="text-sm text-muted-foreground">{courseType}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
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
                        <div className="flex items-center gap-3">
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
                              isPresent
                                ? "bg-green-500/15 text-green-700 dark:text-green-400"
                                : "bg-orange-500/15 text-orange-700 dark:text-orange-400"
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

export default Attendance;
