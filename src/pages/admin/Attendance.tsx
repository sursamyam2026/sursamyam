import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CalendarCheck,
  Clock,
  Trash2,
  Plus,
  Save,
  Users,
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
import { useAttendance } from "@/hooks/use-attendance";
import { useLeads } from "@/hooks/use-leads";
import { attendanceStore, type ClassSession } from "@/lib/attendance";
import { useToast } from "@/hooks/use-toast";

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
const ALL_BATCHES_VALUE = "__all_batches__";
const ALL_CLASS_TYPES_VALUE = "all";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const value = String(index + 1).padStart(2, "0");
  const label = new Date(2026, index, 1).toLocaleDateString(undefined, { month: "long" });
  return { value, label };
});

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

function weekDates(anchorDate: string) {
  const anchor = new Date(`${anchorDate}T00:00:00`);
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - anchor.getDay());
  return Array.from({ length: 7 }, (_, index) => dateString(new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)));
}

function monthDates(anchorDate: string) {
  const anchor = new Date(`${anchorDate}T00:00:00`);
  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  const gridEnd = new Date(monthEnd);
  gridEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));

  const dates: string[] = [];
  const current = new Date(gridStart);
  while (current <= gridEnd) {
    dates.push(dateString(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function isSameMonth(date: string, anchorDate: string) {
  return monthKey(date) === monthKey(anchorDate);
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

function parseStudentBatch(message: string) {
  return parseStudentBatchName(message).toLowerCase();
}

function parseStudentBatchName(message: string) {
  const match = message.match(/^Batch:\s*(.+)$/im);
  return match?.[1]?.trim() || "";
}

function matchesClassAssignment(message: string, classType: string, batch: string) {
  if (!matchesClassType(message, classType)) return false;
  const normalizedBatch = batch.trim().toLowerCase();
  if (!normalizedBatch) return true;
  return parseStudentBatch(message) === normalizedBatch;
}

function sortedByDateAndTime(sessions: ClassSession[]) {
  return [...sessions].sort((a, b) => {
    const dateDiff = a.classDate.localeCompare(b.classDate);
    return dateDiff || a.classTime.localeCompare(b.classTime);
  });
}

const Attendance = () => {
  const navigate = useNavigate();
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [classDate, setClassDate] = useState(todayString());
  const [classTime, setClassTime] = useState("17:00");
  const [courseType, setCourseType] = useState(COURSE_TYPES[0]);
  const [classBatch, setClassBatch] = useState("");
  const [pendingDeleteSession, setPendingDeleteSession] = useState<ClassSession | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [repeatStartDate, setRepeatStartDate] = useState(todayString());
  const [repeatWeekday, setRepeatWeekday] = useState(dayLabel(todayString()));
  const [repeatMonths, setRepeatMonths] = useState("3");
  const [reportMonth, setReportMonth] = useState(monthKey(todayString()));
  const [reportCourseType, setReportCourseType] = useState(ALL_CLASS_TYPES_VALUE);
  const [classFilterDate, setClassFilterDate] = useState(todayString());
  const [classFilterCourseType, setClassFilterCourseType] = useState(ALL_CLASS_TYPES_VALUE);
  const [classFilterBatch, setClassFilterBatch] = useState("");
  const [scheduleDate, setScheduleDate] = useState(todayString());
  const [scheduleMonth, setScheduleMonth] = useState(monthKey(todayString()));
  const [classView, setClassView] = useState<"list" | "weekly" | "monthly">("list");
  const [classStatusTab, setClassStatusTab] = useState<(typeof CLASS_STATUS_GROUPS)[number]["value"]>("not_marked");
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
  const { toast } = useToast();

  const enrolledStudents = useMemo(
    () => leads.filter((lead) => lead.status === "enrolled"),
    [leads],
  );

  const eligibleStudents = useMemo(
    () => enrolledStudents.filter((student) => matchesClassAssignment(student.message, courseType, classBatch)),
    [enrolledStudents, courseType, classBatch],
  );

  const batchOptions = useMemo(() => {
    const batches = new Map<string, string>();
    enrolledStudents
      .filter((student) => matchesClassType(student.message, courseType))
      .forEach((student) => {
        const batch = parseStudentBatchName(student.message);
        if (batch) batches.set(batch.toLowerCase(), batch);
      });

    if (classBatch.trim()) {
      batches.set(classBatch.trim().toLowerCase(), classBatch.trim());
    }

    return Array.from(batches.values()).sort((a, b) => a.localeCompare(b));
  }, [classBatch, enrolledStudents, courseType]);

  const classFilterBatchOptions = useMemo(() => {
    const batches = new Map<string, string>();
    sessions
      .filter((session) => classFilterCourseType === ALL_CLASS_TYPES_VALUE || session.courseType === classFilterCourseType)
      .forEach((session) => {
        const batch = session.batch?.trim();
        if (batch) batches.set(batch.toLowerCase(), batch);
      });

    enrolledStudents
      .filter(
        (student) =>
          classFilterCourseType === ALL_CLASS_TYPES_VALUE ||
          matchesClassType(student.message, classFilterCourseType),
      )
      .forEach((student) => {
        const batch = parseStudentBatchName(student.message);
        if (batch) batches.set(batch.toLowerCase(), batch);
      });

    if (classFilterBatch.trim()) {
      batches.set(classFilterBatch.trim().toLowerCase(), classFilterBatch.trim());
    }

    return Array.from(batches.values()).sort((a, b) => a.localeCompare(b));
  }, [classFilterBatch, classFilterCourseType, enrolledStudents, sessions]);

  const eligibleStudentIds = useMemo(
    () => eligibleStudents.map((student) => student.id),
    [eligibleStudents],
  );

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

  const pageError = leadsError || attendanceError;
  const isLoading = isLoadingLeads || isLoadingAttendance;
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
    return (
      (!classFilterDate || session.classDate === classFilterDate) &&
      (classFilterCourseType === ALL_CLASS_TYPES_VALUE || session.courseType === classFilterCourseType) &&
      (!classFilterBatch || session.batch === classFilterBatch)
    );
  });

  const scheduleScopeSessions = sessions;

  const scheduleAnchorDate = scheduleDate || todayString();
  const monthlyScheduleAnchorDate = `${scheduleMonth}-01`;
  const weeklyScheduleDates = weekDates(scheduleAnchorDate);
  const monthlyScheduleDates = monthDates(monthlyScheduleAnchorDate);
  const weeklyScheduleDateSet = new Set(weeklyScheduleDates);
  const monthlyScheduleDateSet = new Set(monthlyScheduleDates);
  const weeklyScheduleSessions = sortedByDateAndTime(
    scheduleScopeSessions.filter((session) => weeklyScheduleDateSet.has(session.classDate)),
  );
  const monthlyScheduleSessions = sortedByDateAndTime(
    scheduleScopeSessions.filter((session) => monthlyScheduleDateSet.has(session.classDate)),
  );

  const sortedFilteredSessions = sortedByDateAndTime(filteredSessions);

  const classStatusGroups = CLASS_STATUS_GROUPS.map((group) => ({
    ...group,
    sessions: sortedFilteredSessions.filter(
      (session) => classStatusForSession(session) === group.value,
    ),
  }));
  const activeClassGroup =
    classStatusGroups.find((group) => group.value === classStatusTab) ?? classStatusGroups[0];

  const openClassDialog = (session?: ClassSession) => {
    if (session) {
      setEditingSessionId(session.id);
      setClassDate(session.classDate);
      setClassTime(session.classTime.slice(0, 5));
      setCourseType(session.courseType);
      setClassBatch(session.batch ?? "");
    } else {
      setEditingSessionId(null);
      setClassDate(todayString());
      setClassTime("17:00");
      setCourseType(COURSE_TYPES[0]);
      setClassBatch("");
    }
    setClassDialogOpen(true);
  };

  const handleCourseTypeChange = (value: string) => {
    setCourseType(value);
    setClassBatch("");
  };

  const handleClassFilterCourseTypeChange = (value: string) => {
    setClassFilterCourseType(value);
    setClassFilterBatch("");
  };

  const renderBatchSelect = () => (
    <Select
      value={classBatch || ALL_BATCHES_VALUE}
      onValueChange={(value) => setClassBatch(value === ALL_BATCHES_VALUE ? "" : value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select batch" />
      </SelectTrigger>
      <SelectContent className="bg-white text-[#1B4D3E]">
        <SelectItem value={ALL_BATCHES_VALUE}>All batches</SelectItem>
        {batchOptions.map((batch) => (
          <SelectItem key={batch} value={batch}>
            {batch}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const renderClassFilterBatchSelect = () => (
    <Select
      value={classFilterBatch || ALL_BATCHES_VALUE}
      onValueChange={(value) => setClassFilterBatch(value === ALL_BATCHES_VALUE ? "" : value)}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white text-[#1B4D3E]">
        <SelectItem value={ALL_BATCHES_VALUE}>All batches</SelectItem>
        {classFilterBatchOptions.map((batch) => (
          <SelectItem key={batch} value={batch}>
            {batch}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const scheduleYear = scheduleMonth.slice(0, 4);
  const scheduleMonthValue = scheduleMonth.slice(5, 7);
  const yearOptions = Array.from(
    new Set([
      String(new Date().getFullYear() - 1),
      String(new Date().getFullYear()),
      String(new Date().getFullYear() + 1),
      ...sessions.map((session) => session.classDate.slice(0, 4)),
    ]),
  ).sort();

  const setScheduleMonthPart = (part: "month" | "year", value: string) => {
    setScheduleMonth(part === "month" ? `${scheduleYear}-${value}` : `${value}-${scheduleMonthValue}`);
  };

  const renderWeeklyScheduleControls = () => (
    <Card variant="default" className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <p className="text-sm text-muted-foreground mb-1">Go to date</p>
          <DatePicker value={scheduleDate} onChange={setScheduleDate} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setScheduleDate(todayString())}
          >
            Today
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderMonthlyScheduleControls = () => (
    <Card variant="default" className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid w-full gap-3 sm:max-w-md sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Month</p>
            <Select value={scheduleMonthValue} onValueChange={(value) => setScheduleMonthPart("month", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white text-[#1B4D3E]">
                {MONTH_OPTIONS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Year</p>
            <Select value={scheduleYear} onValueChange={(value) => setScheduleMonthPart("year", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white text-[#1B4D3E]">
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setScheduleMonth(monthKey(todayString()))}
        >
          This month
        </Button>
      </div>
    </Card>
  );

  const toggleClassSelection = (sessionId: string, checked: boolean) => {
    setSelectedClassIds((current) =>
      checked
        ? [...new Set([...current, sessionId])]
        : current.filter((id) => id !== sessionId),
    );
  };

  const saveClass = async () => {
    setIsSaving(true);
    try {
      const session = await attendanceStore.saveSession({
        id: editingSessionId ?? undefined,
        classDate,
        classDay: dayLabel(classDate),
        classTime,
        courseType,
        batch: classBatch,
      });
      await attendanceStore.saveRoster(session.id, eligibleStudentIds);
      await refreshAttendance();
      setClassDialogOpen(false);
      setEditingSessionId(null);
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
          batch: classBatch,
        });
        await attendanceStore.saveRoster(session.id, eligibleStudentIds);
      }

      await refreshAttendance();
      toast({
        title: `${dates.length} ${dates.length === 1 ? "class" : "classes"} created`,
        description: `${courseType}${classBatch.trim() ? ` · ${classBatch.trim()}` : ""} every ${repeatWeekday} at ${formatTime(classTime)}, starting ${displayDate(dates[0])}.`,
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

  const deleteClass = async () => {
    if (!pendingDeleteSession) return;
    setIsSaving(true);
    try {
      await attendanceStore.removeSession(pendingDeleteSession.id);
      setPendingDeleteSession(null);
      await refreshAttendance();
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
      const deletedCount = selectedClassIds.length;
      setSelectedClassIds([]);
      setBulkDeleteOpen(false);
      await refreshAttendance();
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
        <span className="font-medium text-foreground">{courseType}</span>
        {classBatch.trim() ? <> in <span className="font-medium text-foreground">{classBatch.trim()}</span>.</> : "."}
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

  const renderClassStatusBadge = (session: ClassSession) => {
    const statusKey = classStatusForSession(session);
    const status =
      statusKey === "complete"
        ? "Complete"
        : statusKey === "partial"
          ? "Partial"
          : "Not marked";

    return (
      <Badge
        title={status}
        className={
          `min-w-0 w-fit max-w-full whitespace-normal px-2 text-center leading-tight ${
            statusKey === "complete"
              ? "bg-green-500/15 text-green-700"
              : statusKey === "partial"
                ? "bg-gold/20 text-gold-foreground"
                : "bg-muted text-muted-foreground"
          }`
        }
      >
        {status}
      </Badge>
    );
  };

  const renderScheduleClass = (session: ClassSession) => (
    <button
      key={session.id}
      type="button"
      onClick={() => navigate(`/admin/attendance/${session.id}`)}
      className="w-full min-w-0 rounded-md border border-border bg-background p-2 text-left transition hover:border-[#C9922A] hover:bg-[#F5ECD7]/40"
    >
      <div className="flex min-w-0 flex-col items-start gap-2">
        <p className="text-sm font-medium">{formatTime(session.classTime)}</p>
        {renderClassStatusBadge(session)}
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-foreground">{session.courseType}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{session.batch || "All batches"}</p>
    </button>
  );

  const renderWeeklySchedule = () => (
    <Card variant="default" className="p-0 overflow-hidden">
      <div className="flex flex-col gap-1 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">Weekly Schedule</h2>
          <p className="text-sm text-muted-foreground">
            {displayDate(weeklyScheduleDates[0])} to {displayDate(weeklyScheduleDates[6])}
          </p>
        </div>
        <Badge className="w-fit bg-muted text-muted-foreground">
          {weeklyScheduleSessions.length} {weeklyScheduleSessions.length === 1 ? "class" : "classes"}
        </Badge>
      </div>
      <div className="grid border-border md:grid-cols-7">
        {weeklyScheduleDates.map((date) => {
          const daySessions = weeklyScheduleSessions.filter((session) => session.classDate === date);
          return (
            <div key={date} className="min-h-[180px] border-b border-border p-3 md:border-b-0 md:border-r last:md:border-r-0">
              <div className="mb-3">
                <p className="text-sm font-semibold">{dayLabel(date)}</p>
                <p className="text-xs text-muted-foreground">{displayDate(date)}</p>
              </div>
              <div className="space-y-2">
                {daySessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No classes</p>
                ) : (
                  daySessions.map(renderScheduleClass)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );

  const renderMonthlySchedule = () => (
    <Card variant="default" className="p-0 overflow-hidden">
      <div className="flex flex-col gap-1 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">Monthly Schedule</h2>
          <p className="text-sm text-muted-foreground">{displayMonth(scheduleMonth)}</p>
        </div>
        <Badge className="w-fit bg-muted text-muted-foreground">
          {monthlyScheduleSessions.length} {monthlyScheduleSessions.length === 1 ? "class" : "classes"}
        </Badge>
      </div>
      <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="px-2 py-2">
            {weekday.slice(0, 3)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-7">
        {monthlyScheduleDates.map((date) => {
          const daySessions = monthlyScheduleSessions.filter((session) => session.classDate === date);
          return (
            <div
              key={date}
              className={`min-h-[150px] border-b border-border p-3 md:border-r last:md:border-r-0 ${
                isSameMonth(date, monthlyScheduleAnchorDate) ? "bg-background" : "bg-muted/20 text-muted-foreground"
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{new Date(`${date}T00:00:00`).getDate()}</p>
                <p className="text-xs md:hidden">{dayLabel(date)}</p>
              </div>
              <div className="space-y-2">
                {daySessions.map(renderScheduleClass)}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );

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
              <TableHead>Batch</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {group.sessions.map((session) => {
              const rosterCount = rosterCountBySession.get(session.id) ?? 0;
              const checked = selectedClassIds.includes(session.id);

              return (
                <TableRow
                  key={session.id}
                  onClick={() => navigate(`/admin/attendance/${session.id}`)}
                  className="cursor-pointer"
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
                  <TableCell>{session.batch || "All batches"}</TableCell>
                  <TableCell>{rosterCount}</TableCell>
                  <TableCell>{renderClassStatusBadge(session)}</TableCell>
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
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-auto min-w-max justify-start">
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="recurring">Recurring Schedule</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="classes" className="space-y-5">
          <div className="flex w-fit rounded-md border border-border bg-muted/30 p-1">
            <Button
              type="button"
              size="sm"
              variant={classView === "list" ? "default" : "ghost"}
              onClick={() => setClassView("list")}
            >
              List
            </Button>
            <Button
              type="button"
              size="sm"
              variant={classView === "weekly" ? "default" : "ghost"}
              onClick={() => setClassView("weekly")}
            >
              Week
            </Button>
            <Button
              type="button"
              size="sm"
              variant={classView === "monthly" ? "default" : "ghost"}
              onClick={() => setClassView("monthly")}
            >
              Month
            </Button>
          </div>

          {classView === "list" && (
            <>
              <Card variant="default" className="p-5">
                <div className="grid gap-4 md:grid-cols-[minmax(160px,1fr)_minmax(210px,1fr)_minmax(180px,1fr)_auto] md:items-end">
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
                    <Select value={classFilterCourseType} onValueChange={handleClassFilterCourseTypeChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-[#1B4D3E]">
                        <SelectItem value={ALL_CLASS_TYPES_VALUE}>All classes</SelectItem>
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
                    <p className="text-sm text-muted-foreground mb-1">Batch</p>
                    {renderClassFilterBatchSelect()}
                    <p className="mt-1 min-h-4 text-xs text-transparent">.</p>
                  </div>
                  <div className="flex md:pb-5">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full md:w-auto"
                      onClick={() => {
                        setClassFilterDate("");
                        setClassFilterCourseType(ALL_CLASS_TYPES_VALUE);
                        setClassFilterBatch("");
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
                      Showing {activeClassGroup.sessions.length} of {filteredSessions.length} filtered classes
                    </p>
                    <div className="flex min-w-0 flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedClassIds(activeClassGroup.sessions.map((session) => session.id))}
                        disabled={activeClassGroup.sessions.length === 0}
                      >
                        Select Classes
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
                        className="whitespace-normal text-left"
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
                  <p className="text-sm mt-1">Adjust the date, class type, or batch.</p>
                </Card>
              ) : (
                <Tabs value={classStatusTab} onValueChange={(value) => setClassStatusTab(value as typeof classStatusTab)} className="space-y-4">
                  <div className="overflow-x-auto pb-1">
                    <TabsList className="h-auto min-w-max justify-start">
                      {classStatusGroups.map((group) => (
                        <TabsTrigger key={group.value} value={group.value}>
                          {group.label} ({group.sessions.length})
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  {classStatusGroups.map((group) => (
                    <TabsContent key={group.value} value={group.value} className="mt-0">
                      {group.sessions.length === 0 ? (
                        <Card variant="default" className="p-10 text-center text-muted-foreground">
                          <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
                          <p className="font-medium text-foreground">No {group.label.toLowerCase()} classes</p>
                          <p className="text-sm mt-1">{group.description}</p>
                        </Card>
                      ) : (
                        renderClassGroupTable(group)
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </>
          )}

          {classView === "weekly" && (
            <>
              {isLoading ? (
                <Card variant="default" className="p-8 text-center text-muted-foreground">
                  <p className="font-medium text-foreground">Loading weekly schedule...</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {renderWeeklyScheduleControls()}
                  {renderWeeklySchedule()}
                </div>
              )}
            </>
          )}

          {classView === "monthly" && (
            <>
              {isLoading ? (
                <Card variant="default" className="p-8 text-center text-muted-foreground">
                  <p className="font-medium text-foreground">Loading monthly schedule...</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {renderMonthlyScheduleControls()}
                  {renderMonthlySchedule()}
                </div>
              )}
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
                <Select value={courseType} onValueChange={handleCourseTypeChange}>
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
                <p className="text-sm text-muted-foreground mb-1">Batch</p>
                {renderBatchSelect()}
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
              <div className="sm:col-span-2 lg:col-span-2">
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
                      <TableHead>Classes</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>Attendance %</TableHead>
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

      <Dialog
        open={classDialogOpen}
        onOpenChange={(open) => {
          setClassDialogOpen(open);
          if (!open) setEditingSessionId(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Class</DialogTitle>
            <DialogDescription>
              Add a class with date, day, time, type, and batch. Matching enrolled students are added automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
              <Select value={courseType} onValueChange={handleCourseTypeChange}>
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
              <p className="text-sm text-muted-foreground mb-1">Batch</p>
              {renderBatchSelect()}
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
