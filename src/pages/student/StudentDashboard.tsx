import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStudentAuth } from "@/hooks/use-student-auth";
import { leadsStore } from "@/lib/leads";
import { Link, useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const { session, logout } = useStudentAuth();
  const navigate = useNavigate();

  if (!session) return null;

  const rollNumber = leadsStore.findByEmail(session.email)?.rollNumber;
  const qp = encodeURIComponent(session.email);

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold">{session.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{session.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              navigate("/student/login", { replace: true });
            }}
          >
            Sign out
          </Button>
        </div>

        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Your Roll Number</p>
          {rollNumber ? (
            <p className="mt-2 text-3xl font-bold text-[#C9922A]">{rollNumber}</p>
          ) : (
            <p className="mt-2 text-muted-foreground leading-relaxed">
              Roll number will be assigned upon enrollment confirmation
            </p>
          )}
        </Card>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link to={`/fees/new-student?email=${qp}`}>Fees — New Student</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/fees/existing-student?email=${qp}`}>Fees — Existing</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
