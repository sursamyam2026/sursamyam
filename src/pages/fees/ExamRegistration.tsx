import { FormEvent, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FeesPageLayout from "@/components/fees/FeesPageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { examRegistrationsStore } from "@/lib/exam-registrations";
import { useNavigate } from "react-router-dom";

const ExamRegistration = () => {
  const navigate = useNavigate();
  const [rollNumber, setRollNumber] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedRollNumber = rollNumber.trim();
    if (!trimmedRollNumber) return;
    if (examRegistrationsStore.findByRollNumber(trimmedRollNumber)) {
      setIsSubmitted(false);
      setShowDuplicateDialog(true);
      return;
    }

    examRegistrationsStore.add(trimmedRollNumber);
    setRollNumber("");
    setIsSubmitted(true);
  };

  return (
    <FeesPageLayout
      eyebrow="Exam Registration"
      title="Register for Music Exams"
      description="Submit your roll number to register for the exam."
    >
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 bg-secondary/5 border-primary/20">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-4 text-sm text-[#4A5E52] hover:text-[#C9922A] transition-colors"
          >
            ← Back to Home
          </button>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6 text-center">
            Ready to Register?
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="space-y-2">
              <Label htmlFor="roll-number">Roll Number</Label>
              <Input
                id="roll-number"
                value={rollNumber}
                onChange={(event) => {
                  setRollNumber(event.target.value);
                  if (isSubmitted) setIsSubmitted(false);
                  if (showDuplicateDialog) setShowDuplicateDialog(false);
                }}
                placeholder="Enter your roll number"
                autoComplete="off"
                required
              />
            </div>
            <Button variant="hero" type="submit" className="w-full">
              Submit
            </Button>
          </form>
          {isSubmitted ? (
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-center">
              <p className="font-display text-xl font-semibold text-primary">
                Registration received
              </p>
              <p className="mt-2 text-sm text-[#4A5E52]">
                Thank you. We will contact you shortly with the next steps for your exam registration.
              </p>
            </div>
          ) : null}
        </Card>
      </div>
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Already registered</AlertDialogTitle>
            <AlertDialogDescription>
              This roll number has already been registered for the exam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowDuplicateDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FeesPageLayout>
  );
};

export default ExamRegistration;
