import { Card } from "@/components/ui/card";
import { useAttendance } from "@/hooks/use-attendance";
import { useExamRegistrations } from "@/hooks/use-exam-registrations";
import { useLeads } from "@/hooks/use-leads";
import { CalendarCheck, Inbox, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const leadStatusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Converted",
  registered: "Registered",
  enrolled: "Enrolled",
  discontinued: "Discontinued",
  declined: "Declined",
};

const Dashboard = () => {
  const { leads, isLoading, error } = useLeads();
  const { records: attendanceRecords } = useAttendance();
  const { registrations: examRegistrations } = useExamRegistrations();
  const newCount = leads.filter((l) => l.status === "new").length;
  const enrolledCount = leads.filter((l) => l.status === "enrolled").length;
  const latestAttendanceDate = attendanceRecords[0]?.classDate;
  const latestAttendanceRecords = latestAttendanceDate
    ? attendanceRecords.filter((record) => record.classDate === latestAttendanceDate)
    : [];
  const latestPresentCount = latestAttendanceRecords.filter((record) => record.status === "present").length;
  const latestAttendanceRate =
    latestAttendanceRecords.length === 0
      ? 0
      : Math.round((latestPresentCount / latestAttendanceRecords.length) * 100);
  const recent = leads.slice(0, 5);

  const stats = [
    { label: "New Inquiries", value: newCount, icon: Inbox, color: "text-primary" },
    { label: "Enrolled Students", value: enrolledCount, icon: Users, color: "text-gold" },
    {
      label: "Latest Attendance",
      value: latestAttendanceRecords.length === 0 ? "-" : `${latestAttendanceRate}%`,
      icon: CalendarCheck,
      color: "text-green-700",
    },
    {
      label: "Exam Registrations",
      value: examRegistrations.length,
      icon: Sparkles,
      color: "text-accent-foreground",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {error ? "Unable to load leads." : "Overview of your inquiries and leads."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} variant="elevated" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="font-display text-3xl font-bold mt-1">{s.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card variant="default" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Recent Submissions</h2>
          <Link to="/admin/leads" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-sm">Loading leads...</p>
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Inbox className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No leads yet. Submissions from the contact form will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((l) => (
              <li key={l.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{l.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{l.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </p>
                  <span className="text-xs text-primary">
                    {leadStatusLabels[l.status] ?? l.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
