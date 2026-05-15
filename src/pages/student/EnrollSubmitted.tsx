import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const EnrollSubmitted = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <Card variant="elevated" className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#1B4D3E] mb-2">
            Enrollment Submitted
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Your enrollment request has been submitted successfully! We will
            review your details and get back to you shortly.
          </p>
          <Button
            variant="hero"
            className="w-full sm:w-auto"
            onClick={() => navigate("/")}
          >
            Home
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default EnrollSubmitted;