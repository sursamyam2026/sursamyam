import FeesPageLayout from "@/components/fees/FeesPageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { leadsStore } from "@/lib/leads";

const ExistingStudent = () => {
  const location = useLocation();
  const studentEmail = new URLSearchParams(location.search).get("email")?.trim().toLowerCase() ?? "";
  const studentLead = studentEmail ? leadsStore.findByEmail(studentEmail) : null;
  const rollNumber = studentLead?.rollNumber;

  return (
    <FeesPageLayout
      eyebrow="Existing Student"
      title="Pay Your Monthly Fees"
      description="Continue your riyaaz with us. Existing students can renew their monthly fees here."
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-6">
          <p className="text-sm text-[#4A5E52]">Your Roll Number</p>
          {rollNumber ? (
            <p className="mt-2 text-3xl font-bold text-[#C9922A]">{rollNumber}</p>
          ) : (
            <p className="mt-2 text-[#4A5E52]">
              Roll number will be assigned upon enrollment confirmation
            </p>
          )}
        </Card>

        <Card className="p-8 lg:p-10 border-2 border-primary/20">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
            Monthly Fee Payment
          </h2>
          <p className="text-muted-foreground mb-6">
            Reach out to us to pay your monthly fees, switch courses, or
            re-enroll after a break. Our team will share the latest payment
            details and confirm your schedule.
          </p>

          <ul className="space-y-3 mb-8 text-sm text-foreground">
            <li>
              <span className="text-muted-foreground">Shadaj / Gandhar:</span>{" "}
              <span className="font-semibold">₹4,000 / month</span>
            </li>
            <li>
              <span className="text-muted-foreground">Pancham / Nishad:</span>{" "}
              <span className="font-semibold">₹2,000 / month</span>
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="hero" asChild>
              <Link to="/#contact">Contact us to pay</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:hello@sursamyam.com">Email support</a>
            </Button>
          </div>
        </Card>
      </div>
    </FeesPageLayout>
  );
};

export default ExistingStudent;
