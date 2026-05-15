import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStudentAuth } from "@/hooks/use-student-auth";
import { studentAccountsRepo } from "@/lib/student-auth";
import type { EnrollmentPaymentSnapshot } from "@/lib/student-auth.types";
import { formatRupee } from "@/lib/fees-courses";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const { session } = useStudentAuth();

  if (!session) return null;

  const account = studentAccountsRepo.findByEmail(session.email);
  const enrollment: EnrollmentPaymentSnapshot | undefined = account?.enrollmentSnapshot;
  const qp = encodeURIComponent(session.email);

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">{session.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{session.email}</p>
        </div>

        {enrollment ? (
          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Your Enrollment</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Course</dt>
                <dd className="font-medium">{enrollment.courseName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Track</dt>
                <dd className="font-medium capitalize">{enrollment.track}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Monthly fee</dt>
                <dd className="font-medium">{formatRupee(enrollment.monthlyRupee)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Registration fee</dt>
                <dd className="font-medium">{formatRupee(enrollment.registrationRupee)}</dd>
              </div>
              <div className="flex justify-between border-t pt-3">
                <dt className="text-muted-foreground">Grand total</dt>
                <dd className="font-bold text-[#C9922A]">{formatRupee(enrollment.grandTotalRupee)}</dd>
              </div>
            </dl>
          </Card>
        ) : (
          <Card className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Enrollment</p>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              No course enrolled yet. <Link to="/student/enroll" className="text-primary hover:underline">Enroll now</Link>
            </p>
          </Card>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link to={`/fees/existing-student?email=${qp}`}>Fees — Existing Student</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/fees/exam-registration?email=${qp}`}>Exam Registration</Link>
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