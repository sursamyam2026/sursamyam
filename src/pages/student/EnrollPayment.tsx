import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { EnrollCheckoutState } from "@/pages/student/EnrollStart";
import { finalizeEnrollmentCheckout } from "@/lib/leads";

const CONVENIENCE_FEE_RUPEES = 150;

function formatRupee(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

// Parse course name: "Adults - Shadaj" or "Kids - Gandhar"
function parseCourse(courseName: string): { track: string; name: string } {
  const parts = courseName.split(" - ");
  return { track: parts[0]?.toLowerCase() ?? "adults", name: parts[1] ?? courseName };
}

const coursePricing: Record<string, { monthly: number; registration: number }> = {
  "Shadaj": { monthly: 4000, registration: 1000 },
  "Pancham": { monthly: 2000, registration: 1000 },
  "Gandhar": { monthly: 4000, registration: 1000 },
  "Nishad": { monthly: 2000, registration: 1000 },
};

const EnrollPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const state = location.state as EnrollCheckoutState | null | undefined;

  const [agreed, setAgreed] = useState(false);

  if (!state?.email || !state.courseName) {
    return <Navigate to="/student/enroll" replace />;
  }

  const { name: courseShortName } = parseCourse(state.courseName);
  const pricing = coursePricing[courseShortName] ?? { monthly: 0, registration: 0 };
  const monthly = pricing.monthly;
  const registration = pricing.registration;
  const subtotal = monthly + registration;
  const convenience = CONVENIENCE_FEE_RUPEES;
  const grand = subtotal + convenience;

  const handleSubmit = () => {
    if (!agreed) return;

    finalizeEnrollmentCheckout({
      email: state.email,
      name: state.name,
      phone: state.phone,
      age: state.age,
      city: state.city,
      country: state.country,
      courseLine: state.courseName,
    });

    toast({
      title: "Enrollment submitted",
      description: "Your enrollment request has been submitted successfully.",
    });
    navigate("/student/enroll/submitted", { replace: true });
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-lg space-y-6">
        <Card variant="elevated" className="p-8">
          <button
            type="button"
            onClick={() => navigate("/fees/new-student")}
            className="mb-4 text-sm text-[#4A5E52] hover:text-[#C9922A] transition-colors"
          >
            ← Back to Courses
          </button>
          <h1 className="font-display text-2xl font-bold text-[#1B4D3E] mb-6">Payment summary</h1>

          {/* Student details */}
          <div className="mb-6 rounded-lg bg-[#FDF6EC] border border-[#E8D5A3] p-4 text-sm space-y-1.5">
            <p className="text-[#4A5E52]">
              <span className="text-[#1B4D3E] font-medium">Student Name</span> : {state.name}
            </p>
            <p className="text-[#4A5E52]">
              <span className="text-[#1B4D3E] font-medium">Email Address</span> : {state.email}
            </p>
            <p className="text-[#4A5E52]">
              <span className="text-[#1B4D3E] font-medium">Mobile Number</span> : {state.phone}
            </p>
          </div>

          <dl className="space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-[#E8D5A3] pb-3">
              <dt className="text-[#4A5E52]">
                1 × {state.courseName} <span className="text-muted-foreground">(monthly)</span>
              </dt>
              <dd className="font-medium text-[#1B4D3E]">{formatRupee(monthly)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#E8D5A3] pb-3">
              <dt className="text-[#4A5E52]">Registration fee (one-time)</dt>
              <dd className="font-medium text-[#1B4D3E]">{formatRupee(registration)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#E8D5A3] pb-3">
              <dt className="text-[#4A5E52]">Total</dt>
              <dd className="font-medium text-[#1B4D3E]">{formatRupee(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#E8D5A3] pb-3">
              <dt className="text-[#4A5E52]">Convenience fee</dt>
              <dd className="font-medium text-[#1B4D3E]">{formatRupee(convenience)}</dd>
            </div>
            <div className="flex justify-between gap-4 pt-2 text-base">
              <dt className="font-display font-semibold text-[#1B4D3E]">Grand total</dt>
              <dd className="font-display font-bold text-[#C9922A]">{formatRupee(grand)}</dd>
            </div>
          </dl>

          <div className="mt-8 flex items-center gap-3">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(c) => setAgreed(c === true)}
            />
            <Label htmlFor="terms" className="cursor-pointer text-sm leading-snug text-[#4A5E52]">
              I have read and agree to the Terms and Conditions.
            </Label>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse sm:justify-between">
            <Button
              variant="hero"
              className="w-full sm:w-auto"
              disabled={!agreed}
              onClick={handleSubmit}
            >
              Submit
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => navigate("/fees/new-student")}
            >
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EnrollPayment;