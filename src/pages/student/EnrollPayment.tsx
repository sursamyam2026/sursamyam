import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { EnrollCheckoutState } from "@/pages/student/EnrollStart";
import {
  CONVENIENCE_FEE_RUPEES,
  formatRupee,
  getCourse,
  getMonthlyRupee,
} from "@/lib/fees-courses";
import { EnrollmentTermsContent } from "@/content/enrollment-terms";
import { finalizeEnrollmentCheckout } from "@/lib/leads";

const EnrollPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const state = location.state as EnrollCheckoutState | null | undefined;

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!state?.email || !state.courseName || !state.track) {
    return <Navigate to="/student/enroll" replace />;
  }

  const fc = getCourse(state.track, state.courseName);
  if (!fc) {
    return <Navigate to="/student/enroll" replace />;
  }

  const selectedFormat = state.format ?? "online";
  const monthly = getMonthlyRupee(fc, selectedFormat);
  const registration = fc.registrationRupee;
  const subtotal = monthly + registration;
  const convenience = CONVENIENCE_FEE_RUPEES;
  const grand = subtotal + convenience;
  const formatLabel = selectedFormat === "offline" ? "Offline" : "Online";

  const handleSubmit = async () => {
    if (!agreed) return;

    setIsSubmitting(true);
    try {
      await finalizeEnrollmentCheckout({
        email: state.email,
        name: state.name,
        phone: state.phone,
        age: state.age,
        city: state.city,
        country: state.country,
        courseLine: `${fc.name} (${state.track === "adults" ? "Adults" : "Kids"} · ${formatLabel})`,
      });

      toast({
        title: "Enrollment submitted",
        description: "Your enrollment request has been submitted successfully.",
      });
      navigate("/student/enroll/submitted", { replace: true });
    } catch (err) {
      toast({
        title: "Unable to submit enrollment",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-lg space-y-6">
        <Card variant="elevated" className="p-8">
          <button
            type="button"
            onClick={() => navigate("/registration/course-details")}
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
            <p className="text-[#4A5E52]">
              <span className="text-[#1B4D3E] font-medium">Class Format</span> : {formatLabel}
            </p>
          </div>

          <dl className="space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-[#E8D5A3] pb-3">
              <dt className="text-[#4A5E52]">
                1 × {fc.name} <span className="text-muted-foreground">(monthly)</span>
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

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(c) => setAgreed(c === true)}
            />
            <Label htmlFor="terms" className="cursor-pointer text-sm leading-snug text-[#4A5E52]">
              I have read and agree to the Terms and Conditions.
            </Label>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-sm font-medium text-[#C9922A] underline-offset-2 hover:underline"
                >
                  View Terms
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-lg border-[#E8D5A3] bg-[#FDF6EC]">
                <DialogHeader>
                  <DialogTitle className="font-display text-[#1B4D3E]">
                    Sur Samyam · Terms and Conditions
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[65vh] pr-4">
                  <EnrollmentTermsContent />
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse sm:justify-between">
            <Button
              variant="hero"
              className="w-full sm:w-auto"
              disabled={!agreed || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => navigate("/registration/course-details")}
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
