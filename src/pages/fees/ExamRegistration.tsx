import FeesPageLayout from "@/components/fees/FeesPageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const levels = [
  { name: "Prarambhik", years: "Year 1", fee: "₹2,000" },
  { name: "Praveshika Pratham", years: "Year 2", fee: "₹2,000" },
  { name: "Praveshika Purna", years: "Year 3", fee: "₹2,500" },
  { name: "Madhyama Pratham", years: "Year 4", fee: "₹2,500" },
  { name: "Madhyama Purna", years: "Year 5", fee: "₹3,000" },
  { name: "Visharad Pratham", years: "Year 6", fee: "₹3,000" },
];

const ExamRegistration = () => {
  return (
    <FeesPageLayout
      eyebrow="Exam Registration"
      title="Register for Music Exams"
      description="Pursue formal certification through recognised Hindustani classical music boards. Register and pay your exam fees below."
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {levels.map((l) => (
          <Card
            key={l.name}
            className="p-6 hover:shadow-lg transition-all border-border"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {l.years}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              {l.name}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Exam fee (one-time)
            </p>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl font-bold text-primary">
                {l.fee}
              </span>
              <span className="text-xs text-muted-foreground">
                + board charges
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="max-w-2xl mx-auto text-center">
        <Card className="p-8 bg-secondary/5 border-primary/20">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
            Ready to Register?
          </h2>
          <p className="text-muted-foreground mb-6">
            Contact us to confirm eligibility, exam dates, and complete your
            registration with the appropriate music board.
          </p>
          <Button variant="hero" asChild>
            <Link to="/#contact">Register for an Exam</Link>
          </Button>
        </Card>
      </div>
    </FeesPageLayout>
  );
};

export default ExamRegistration;
