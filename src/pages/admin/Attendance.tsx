import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Trash2,
  Plus,
  Save,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { attendanceStore, type AttendanceStatus, type ClassSession } from "@/lib/attendance";
import { useToast } from "@/hooks/use-toast";

type DraftRecord = {
  status: AttendanceStatus;
  notes: string;
};

const COURSE_OPTIONS = [
  { value: "Adults - One-on-One - Online", label: "Adults - One-on-One - Online", track: "adults", courseName: "One-on-One", format: "online" },
  { value: "Adults - One-on-One - Offline", label: "Adults - One-on-One - Offline", track: "adults", courseName: "One-on-One", format: "offline" },
  { value: "Adults - Group - Online", label: "Adults - Group - Online", track: "adults", courseName: "Group", format: "online" },
  { value: "Adults - Group - Offline", label: "Adults - Group - Offline", track: "adults", courseName: "Group", format: "offline" },
  { value: "Kids - One-on-One - Online", label: "Kids - One-on-One - Online", track: "kids", courseName: "One-on-One", format: "online" },
  { value: "Kids - One-on-One - Offline", label: "Kids - One-on-One - Offline", track: "kids", courseName: "One-on-One", format: "offline" },
  { value: "Kids - Group - Online", label: "Kids - Group - Online", track: "kids", courseName: "Group", format: "online" },
  { value: "Kids - Group - Offline", label: "Kids - Group - Offline", track: "kids", courseName: "Group", format: "offline" },
];

const COURSE_TYPES = COURSE_OPTIONS.map((option) => option.value);

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const CLASS_STATUS_GROUPS = [
  {
    value: "not_marked",
    label: "Not Marked",
    description: "Classes ready for attendance.",
  },
  {
    value: "partial",
    label: "Partial",
    description: "Classes with some attendance already saved.",
  },
  {
    value: "complete",
    label: "Completed",
    description: "Classes where attendance is complete.",
  },
] as const;

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

function displayMonth(date: string) {
  if (!date) return "-";
  return new Date(`${date}-01T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function monthKey(date: string) {
  return date.slice(0, 7);
}

function dateString(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromString(value: string) {
  if (!value) return undefined;
  return new Date(`${value}T00:00:00`);
}

function toTimeParts(value: string) {
  const [hourText = "17", minuteText = "00"] = value.split(":");
  const hour24 = Number.parseInt(hourText, 10);
  const safeHour = Number.isNaN(hour24) ? 17 : hour24;
  const period = safeHour >= 12 ? "PM" : "AM";
  const hour12 = safeHour % 12 || 12;
  return {
    hour: String(hour12),
    minute: minuteText.padStart(2, "0").slice(0, 2),
    period,
  };
}

function timeFromParts(hour: string, minute: string, period: string) {
  let hour24 = Number.parseInt(hour, 10);
  if (Number.isNaN(hour24)) hour24 = 5;
  if (period === "PM" && hour24 !== 12) hour24 += 12;
  if (period === "AM" && hour24 === 12) hour24 = 0;
  return `${String(hour24).padStart(2, "0")}:${minute}`;
}

const TIME_HOURS = Array.from({ length: 12 }, (_, index) => String(index + 1));
const TIME_MINUTES = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));

function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
          <CalendarDays className="mr-2 h-4 w-4" />
          {value ? displayDate(value) : <span className="text-muted-foreground">{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={dateFromString(value)}
          onSelect={(date) => {
            if (date) onChange(dateString(date));
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const parts = toTimeParts(value);
  const update = (patch: Partial<typeof parts>) => {
    const next = { ...parts, ...patch };
    onChange(timeFromParts(next.hour, next.minute, next.period));
  };

  return (
    <div className="grid grid-cols-[1fr_1fr_1fr] gap-2">
      <Select value={parts.hour} onValueChange={(hour) => update({ hour })}>
        <SelectTrigger aria-label="Hour">
          <Clock className="mr-2 h-4 w-4" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white text-[#1B4D3E]">
          {TIME_HOURS.map((hour) => (
            <SelectItem key={hour} value={hour}>
              {hour}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={parts.minute} onValueChange={(minute) => update({ minute })}>
        <SelectTrigger aria-label="Minute">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white text-[#1B4D3E]">
          {TIME_MINUTES.map((minute) => (
            <SelectItem key={minute} value={minute}>
              {minute}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={parts.period} onValueChange={(period) => update({ period })}>
        <SelectTrigger aria-label="Period">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white text-[#1B4D3E]">
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function recurringDates(startDate: string, weekday: string, months: number) {
  const dates: string[] = [];
  if (!startDate || months <= 0) return dates;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);

  const targetDay = WEEKDAYS.indexOf(weekday);
  if (targetDay === -1) return dates;

  const current = new Date(start);
  const dayOffset = (targetDay - current.getDay() + 7) % 7;
  current.setDate(current.getDate() + dayOffset);

  while (current < end) {
    dates.push(dateString(current));
    current.setDate(current.getDate() + 7);
  }

  return dates;
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

function parseStudentCourse(message: string) {
  const match = message.match(/Course:\s*([^(]+?)\s*\((Adults|Kids)(?:\s*[·•-]\s*(Online|Offline))?\)/i);
  if (!match) return null;
  return {
    courseName: match[1].trim().toLowerCase(),
    track: match[2].trim().toLowerCase(),
    format: match[3]?.trim().toLowerCase() ?? null,
  };
}

function matchesClassType(message: string, classType: string) {
  const option = COURSE_OPTIONS.find((item) => item.value === classType);
  const studentCourse = parseStudentCourse(message);
  if (!option || !studentCourse) return false;
  return (
    studentCourse.track === option.track &&
    studentCourse.courseName === option.courseName.toLowerCase() &&
    studentCourse.format === option.format
  );
}

const Attendance = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [classDate, setClassDate] = useState(todayString());
  const [classTime, setClassTime] = useState("17:00");
  const [courseType, setCourseType] = useState(COURSE_TYPES[0]);
  const [pendingDeleteSession, setPendingDeleteSession] = useState<ClassSession | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [repeatStartDate, setRepeatStartDate] = useState(todayString());
  const [repeatWeekday, setRepeatWeekday] = useState(dayLabel(todayString()));
  const [repeatMonths, setRepeatMonths] = useState("3");
  const [reportMonth, setReportMonth] = useState(monthKey(todayString()));
  const [reportCourseType, setReportCourseType] = useState("all");
  const [classFilterDate, setClassFilterDate] = useState(todayString());
  const [classFilterCourseType, setClassFilterCourseType] = useState("all");
  const [classFilterStatus, setClassFilterStatus] = useState("all");
  const [drafts, setDrafts] = useState<Record<string, DraftRecord>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { leads, isLoading: isLoadingLeads, error: leadsError } = useLeads();
  const {
    records: allAttendanceRecords,
    sessions,
    roster: allRoster,
    isLoading: isLoadingAttendance,
    error: attendanceError,
    refresh: refreshAttendance,
  } = useAttendance();
  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? null;
  const {
    records: sessionRecords,
    roster: sessionRoster,
    isLoading: isLoadingSessionAttendance,
    error: sessionAttendanceError,
    refresh: refreshSessionAttendance,
  } = useAttendanceBySession(selectedSessionId);
  const { toast } = useToast();

  const enrolledStudents = useMemo(
    () => leads.filter((lead) => lead.status === "enrolled"),
    [leads],
  );

  const eligibleStudents = useMemo(
    () => enrolledStudents.filter((student) => matchesClassType(student.message, courseType)),
    [enrolledStudents, courseType],
  );

  const eligibleStudentIds = useMemo(
    () => eligibleStudents.map((student) => student.id),
    [eligibleStudents],
  );

  useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [selectedSessionId, sessions]);

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

  const rosterCountBySession = useMemo(() => {
    const counts = new Map<string, number>();
    allRoster.forEach((member) => {
      counts.set(member.sessionId, (counts.get(member.sessionId) ?? 0) + 1);
    });
    return counts;
  }, [allRoster]);

  const recordCountBySession = useMemo(() => {
    const counts = new Map<string, number>();
    allAttendanceRecords.forEach((record) => {
      counts.set(record.sessionId, (counts.get(record.sessionId) ?? 0) + 1);
    });
    return counts;
  }, [allAttendanceRecords]);

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
  const previewRecurringDates = recurringDates(
    repeatStartDate,
    repeatWeekday,
    Number.parseInt(repeatMonths, 10),
  );

  const classStatusForSession = (session: ClassSession) => {
    const rosterCount = rosterCountBySession.get(session.id) ?? 0;
    const recordCount = recordCountBySession.get(session.id) ?? 0;
    if (rosterCount > 0 && recordCount >= rosterCount) return "complete";
    if (recordCount > 0) return "partial";
    return "not_marked";
  };

  const filteredSessions = sessions.filter((session) => {
    const status = classStatusForSession(session);
    return (
      (!classFilterDate || session.classDate === classFilterDate) &&
      (classFilterCourseType === "all" || session.courseType === classFilterCourseType) &&
      (classFilterStatus === "all" || status === classFilterStatus)
    );
  });

  const sortedFilteredSessions = [...filteredSessions].sort((a, b) => {
    const dateDiff = a.classDate.localeCompare(b.classDate);
    return dateDiff || a.classTime.localeCompare(b.classTime);
  });

  const classStatusGroups = CLASS_STATUS_GROUPS.map((group) => ({
    ...group,
    sessions: sortedFilteredSessions.filter(
      (session) => classStatusForSession(session) === group.value,
    ),
  })).filter((group) => group.sessions.length > 0);

  const openClassDialog = (session?: ClassSession) => {
    if (session) {
      setSelectedSessionId(session.id);
      setClassDate(session.classDate);
      setClassTime(session.classTime.slice(0, 5));
      setCourseType(session.courseType);
    } else {
      setClassDate(todayString());
      setClassTime("17:00");
      setCourseType(COURSE_TYPES[0]);
    }
    setClassDialogOpen(true);
  };

  const toggleClassSelection = (sessionId: string, checked: boolean) => {
    setSelectedClassIds((current) =>
      checked
        ? [...new Set([...current, sessionId])]
        : current.filter((id) => id !== sessionId),
    );
  };

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

  const saveClass = async () => {
    setIsSaving(true);
    try {
      const session = await attendanceStore.saveSession({
        classDate,
        classDay: dayLabel(classDate),
        classTime,
        courseType,
      });
      await attendanceStore.saveRoster(session.id, eligibleStudentIds);
      setSelectedSessionId(session.id);
      await Promise.all([refreshAttendance(), refreshSessionAttendance()]);
      setClassDialogOpen(false);
      toast({
        title: "Class saved",
        description: `${eligibleStudentIds.length} ${eligibleStudentIds.length === 1 ? "student" : "students"} added to ${courseType} on ${displayDate(classDate)}.`,
      });
    } catch (err) {
      toast({
        title: "Unable to save class",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const createRecurringClasses = async () => {
    const months = Number.parseInt(repeatMonths, 10);
    const dates = recurringDates(repeatStartDate, repeatWeekday, months);

    if (dates.length === 0) {
      toast({
        title: "No classes created",
        description: "Please check the start date, weekday, and duration.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      for (const date of dates) {
        const session = await attendanceStore.saveSession({
          classDate: date,
          classDay: dayLabel(date),
          classTime,
          courseType,
        });
        await attendanceStore.saveRoster(session.id, eligibleStudentIds);
      }

      await Promise.all([refreshAttendance(), refreshSessionAttendance()]);
      toast({
        title: `${dates.length} ${dates.length === 1 ? "class" : "classes"} created`,
        description: `${courseType} every ${repeatWeekday} at ${formatTime(classTime)}, starting ${displayDate(dates[0])}.`,
      });
    } catch (err) {
      toast({
        title: "Unable to create recurring classes",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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

  const deleteClass = async () => {
    if (!pendingDeleteSession) return;
    setIsSaving(true);
    try {
      await attendanceStore.removeSession(pendingDeleteSession.id);
      setPendingDeleteSession(null);
      setSelectedSessionId(null);
      await Promise.all([refreshAttendance(), refreshSessionAttendance()]);
      toast({
        title: "Class deleted",
        description: `${pendingDeleteSession.courseType} on ${displayDate(pendingDeleteSession.classDate)} was removed.`,
      });
    } catch (err) {
      toast({
        title: "Unable to delete class",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSelectedClasses = async () => {
    if (selectedClassIds.length === 0) return;
    setIsSaving(true);
    try {
      for (const sessionId of selectedClassIds) {
        await attendanceStore.removeSession(sessionId);
      }
      if (selectedSessionId && selectedClassIds.includes(selectedSessionId)) {
        setSelectedSessionId(null);
      }
      const deletedCount = selectedClassIds.length;
      setSelectedClassIds([]);
      setBulkDeleteOpen(false);
      await Promise.all([refreshAttendance(), refreshSessionAttendance()]);
      toast({
        title: `${deletedCount} ${deletedCount === 1 ? "class" : "classes"} deleted`,
        description: "Selected classes, rosters, and attendance records were removed.",
      });
    } catch (err) {
      toast({
        title: "Unable to delete selected classes",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const reportSessions = sessions.filter(
    (session) =>
      monthKey(session.classDate) === reportMonth &&
      (reportCourseType === "all" || session.courseType === reportCourseType),
  );
  const reportSessionIds = new Set(reportSessions.map((session) => session.id));
  const reportRoster = allRoster.filter((member) => reportSessionIds.has(member.sessionId));
  const reportRecords = allAttendanceRecords.filter((record) => reportSessionIds.has(record.sessionId));
  const reportRows = enrolledStudents.map((student) => {
    const assigned = reportRoster.filter((member) => member.leadId === student.id).length;
    const studentRecords = reportRecords.filter((record) => record.leadId === student.id);
    const present = studentRecords.filter((record) => record.status === "present").length;
    const missed = studentRecords.filter((record) => record.status === "absent").length;
    const unmarked = Math.max(assigned - studentRecords.length, 0);
    const rate = assigned === 0 ? 0 : Math.round((present / assigned) * 100);
    return { student, assigned, present, missed, unmarked, rate };
  }).filter((row) => row.assigned > 0 || row.missed > 0 || row.present > 0);

  const renderAutoRosterSummary = () => (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
        Students are added automatically from enrolled students matching{" "}
        <span className="font-medium text-foreground">{courseType}</span>.
      </div>
      {eligibleStudents.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No enrolled students match this class type and format.
        </p>
      ) : (
        <div className="rounded-md border border-border bg-background p-3">
          <p className="font-medium">{eligibleStudents.length} students will be added</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {eligibleStudents.slice(0, 3).map((student) => student.name).join(", ")}
            {eligibleStudents.length > 3 ? ` and ${eligibleStudents.length - 3} more` : ""}
          </p>
        </div>
      )}
    </div>
  );

  const stats = [
    { label: "Class Students", value: classStudents.length, icon: UserPlus, color: "text-gold" },
    { label: "Present", value: presentCount, icon: CheckCircle2, color: "text-green-700" },
    { label: "Absent", value: absentCount, icon: XCircle, color: "text-orange-700" },
    { label: "Attendance Rate", value: `${attendanceRate}%`, icon: CalendarCheck, color: "text-primary" },
  ];

  const renderClassGroupTable = (
    group: (typeof classStatusGroups)[number],
  ) => (
    <Card key={group.value} variant="default" className="p-0 overflow-hidden">
      <div className="flex flex-col gap-1 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">{group.label}</h2>
          <p className="text-sm text-muted-foreground">{group.description}</p>
        </div>
        <Badge className="w-fit bg-muted text-muted-foreground">
          {group.sessions.length} {group.sessions.length === 1 ? "class" : "classes"}
        </Badge>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[48px]"></TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Class Type</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {group.sessions.map((session) => {
              const rosterCount = rosterCountBySession.get(session.id) ?? 0;
              const statusKey = classStatusForSession(session);
              const status =
                statusKey === "complete"
                  ? "Complete"
                  : statusKey === "partial"
                    ? "Partial"
                    : "Not marked";
              const active = selectedSessionId === session.id;
              const checked = selectedClassIds.includes(session.id);

              return (
                <TableRow
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={active ? "bg-muted/60" : "cursor-pointer"}
                >
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => toggleClassSelection(session.id, value === true)}
                      aria-label={`Select ${session.courseType} on ${displayDate(session.classDate)}`}
                    />
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{displayDate(session.classDate)}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.classDay || dayLabel(session.classDate)}
                    </p>
                  </TableCell>
                  <TableCell>{formatTime(session.classTime)}</TableCell>
                  <TableCell>{session.courseType}</TableCell>
                  <TableCell>{rosterCount}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusKey === "complete"
                          ? "bg-green-500/15 text-green-700"
                          : statusKey === "partial"
                            ? "bg-gold/20 text-gold-foreground"
                            : "bg-muted text-muted-foreground"
                      }
                    >
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPendingDeleteSession(session);
                      }}
                      aria-label={`Delete ${session.courseType} on ${displayDate(session.classDate)}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground mt-1">
            {pageError ? "Unable to load attendance." : "Schedule classes and mark attendance for matching enrolled students."}
          </p>
        </div>
        <Button type="button" onClick={() => openClassDialog()}>
          <Plus className="w-4 h-4" />
          Add Class
        </Button>
      </div>

      <Tabs defaultValue="classes" className="space-y-5">
        <TabsList>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Schedule</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-5">
          <Card variant="default" className="p-5">
            <div className="grid gap-4 md:grid-cols-[minmax(180px,1fr)_minmax(210px,1fr)_minmax(180px,1fr)_auto] md:items-end">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <DatePicker
                  value={classFilterDate}
                  onChange={setClassFilterDate}
                  placeholder="All dates"
                />
                <p className="mt-1 min-h-4 text-xs text-muted-foreground">
                  {classFilterDate ? displayDate(classFilterDate) : "All dates"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Class Type</p>
                <Select value={classFilterCourseType} onValueChange={setClassFilterCourseType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-[#1B4D3E]">
                    <SelectItem value="all">All classes</SelectItem>
                    {COURSE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 min-h-4 text-xs text-transparent">.</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Attendance Status</p>
                <Select value={classFilterStatus} onValueChange={setClassFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-[#1B4D3E]">
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="not_marked">Not marked</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 min-h-4 text-xs text-transparent">.</p>
              </div>
              <div className="flex md:pb-5">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => {
                    setClassFilterDate("");
                    setClassFilterCourseType("all");
                    setClassFilterStatus("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </div>
          </Card>

          {sessions.length > 0 && (
            <Card variant="default" className="p-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredSessions.length} of {sessions.length} classes
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedClassIds(filteredSessions.map((session) => session.id))}
                    disabled={filteredSessions.length === 0}
                  >
                    Select visible
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedClassIds([])}
                    disabled={selectedClassIds.length === 0}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setBulkDeleteOpen(true)}
                    disabled={selectedClassIds.length === 0}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete selected ({selectedClassIds.length})
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {isLoading ? (
            <Card variant="default" className="p-8 text-center text-muted-foreground">
              <p className="font-medium text-foreground">Loading classes...</p>
            </Card>
          ) : sessions.length === 0 ? (
            <Card variant="default" className="p-10 text-center text-muted-foreground">
              <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium text-foreground">No classes scheduled</p>
              <p className="text-sm mt-1">Create a class or recurring schedule to begin.</p>
            </Card>
          ) : filteredSessions.length === 0 ? (
            <Card variant="default" className="p-10 text-center text-muted-foreground">
              <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium text-foreground">No classes match these filters</p>
              <p className="text-sm mt-1">Adjust the date, class type, or attendance status.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {classStatusGroups.map(renderClassGroupTable)}
            </div>
          )}

          {selectedSession && (
            <>
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
                    <h2 className="font-display text-lg font-semibold">{selectedSession.courseType}</h2>
                    <p className="text-sm text-muted-foreground">
                      {displayDate(selectedSession.classDate)} · {selectedSession.classDay || dayLabel(selectedSession.classDate)} · {formatTime(selectedSession.classTime)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => openClassDialog(selectedSession)}>
                      <Plus className="w-4 h-4" />
                      Edit Class
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => markAll("present")}>
                      Mark all present
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => markAll("absent")}>
                      Mark all absent
                    </Button>
                    <Button type="button" size="sm" onClick={saveAttendance} disabled={isSaving || classStudents.length === 0}>
                      <Save className="w-4 h-4" />
                      Save Attendance
                    </Button>
                  </div>
                </div>

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
            </>
          )}
        </TabsContent>

        <TabsContent value="recurring" className="space-y-5">
          <Card variant="default" className="p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">Recurring Schedule</h2>
                <p className="text-sm text-muted-foreground">
                  Create the same class weekly for a period of time.
                </p>
              </div>
              <Button type="button" onClick={createRecurringClasses} disabled={isSaving}>
                <CalendarCheck className="w-4 h-4" />
                Create Schedule
              </Button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Class Type</p>
                <Select value={courseType} onValueChange={setCourseType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-[#1B4D3E]">
                    {COURSE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Time</p>
                <TimePicker value={classTime} onChange={setClassTime} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                <DatePicker value={repeatStartDate} onChange={setRepeatStartDate} />
                <p className="mt-1 text-xs text-muted-foreground">{displayDate(repeatStartDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Every</p>
                <Select value={repeatWeekday} onValueChange={setRepeatWeekday}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-[#1B4D3E]">
                    {WEEKDAYS.map((weekday) => (
                      <SelectItem key={weekday} value={weekday}>
                        {weekday}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <Select value={repeatMonths} onValueChange={setRepeatMonths}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-[#1B4D3E]">
                    <SelectItem value="1">1 month</SelectItem>
                    <SelectItem value="2">2 months</SelectItem>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-sm text-muted-foreground mb-1">Preview</p>
                <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                  <p className="font-medium">{previewRecurringDates.length} classes</p>
                  <p className="text-muted-foreground">
                    {previewRecurringDates[0] ? displayDate(previewRecurringDates[0]) : "-"}
                    {previewRecurringDates.length > 1
                      ? ` to ${displayDate(previewRecurringDates[previewRecurringDates.length - 1])}`
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="default" className="p-5">
            <h2 className="font-display text-lg font-semibold mb-3">Students For This Schedule</h2>
            {renderAutoRosterSummary()}
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-5">
          <Card variant="default" className="p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Month</p>
                <Input type="month" value={reportMonth} onChange={(event) => setReportMonth(event.target.value)} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Class Type</p>
                <Select value={reportCourseType} onValueChange={setReportCourseType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-[#1B4D3E]">
                    <SelectItem value="all">All classes</SelectItem>
                    {COURSE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                <p className="text-muted-foreground">Classes in {displayMonth(reportMonth)}</p>
                <p className="font-display text-2xl font-bold">{reportSessions.length}</p>
              </div>
            </div>
          </Card>

          <Card variant="default" className="p-0 overflow-hidden">
            {reportRows.length === 0 ? (
              <div className="text-center py-16 px-4 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium text-foreground">No report data</p>
                <p className="text-sm mt-1">Create classes with matching enrolled students to see reports.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Missed</TableHead>
                      <TableHead>Unmarked</TableHead>
                      <TableHead>Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportRows.map((row) => (
                      <TableRow key={row.student.id}>
                        <TableCell>
                          <p className="font-medium">{row.student.name}</p>
                          <p className="text-sm text-muted-foreground">{row.student.email}</p>
                        </TableCell>
                        <TableCell className="font-semibold text-[#7A8C7E]">
                          {row.student.rollNumber || "-"}
                        </TableCell>
                        <TableCell>{row.assigned}</TableCell>
                        <TableCell>{row.present}</TableCell>
                        <TableCell>
                          <Badge className={row.missed > 0 ? "bg-orange-500/15 text-orange-700" : "bg-green-500/15 text-green-700"}>
                            {row.missed}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.unmarked}</TableCell>
                        <TableCell>{row.rate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Class</DialogTitle>
            <DialogDescription>
              Add a class with date, day, time, and type. Matching enrolled students are added automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Date</p>
              <DatePicker value={classDate} onChange={setClassDate} />
              <p className="mt-1 text-xs text-muted-foreground">{displayDate(classDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Day</p>
              <Input value={dayLabel(classDate)} disabled />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Time</p>
              <TimePicker value={classTime} onChange={setClassTime} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Class Type</p>
              <Select value={courseType} onValueChange={setCourseType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-[#1B4D3E]">
                  {COURSE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-3">Students</h3>
            {renderAutoRosterSummary()}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setClassDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveClass} disabled={isSaving}>
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Class"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingDeleteSession} onOpenChange={(open) => !open && setPendingDeleteSession(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete class?</DialogTitle>
            <DialogDescription>
              This will remove the class, its student list, and any attendance marked for it.
            </DialogDescription>
          </DialogHeader>
          {pendingDeleteSession && (
            <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
              <p className="font-medium">{pendingDeleteSession.courseType}</p>
              <p className="text-muted-foreground">
                {displayDate(pendingDeleteSession.classDate)} · {formatTime(pendingDeleteSession.classTime)}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setPendingDeleteSession(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={deleteClass} disabled={isSaving}>
              <Trash2 className="w-4 h-4" />
              {isSaving ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete selected classes?</DialogTitle>
            <DialogDescription>
              This will remove selected classes, their student lists, and attendance records.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
            <p className="font-medium">{selectedClassIds.length} selected</p>
            <p className="text-muted-foreground">This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setBulkDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={deleteSelectedClasses} disabled={isSaving}>
              <Trash2 className="w-4 h-4" />
              {isSaving ? "Deleting..." : "Delete selected"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Attendance;
