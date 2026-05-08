import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

export interface Course {
  name: string;
  monthly: string;
  registration: string;
  total: string;
  description: string;
  highlight?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
}

const CourseCard = ({ course }: { course: Course }) => {
  const ctaHref = course.ctaHref ?? "/#contact";
  const ctaLabel = course.ctaLabel ?? `Enroll in ${course.name}`;
  const isInternal = ctaHref.startsWith("/") && !ctaHref.startsWith("/#");

  return (
    <Card
      className={`p-8 flex flex-col h-full transition-all hover:shadow-xl ${
        course.highlight ? "border-primary border-2 shadow-lg" : "border-border"
      }`}
    >
      {course.highlight && (
        <span className="self-start mb-3 px-3 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
          Most Popular
        </span>
      )}
      <h3 className="font-display text-3xl font-bold text-foreground mb-2">
        {course.name}
      </h3>
      <p className="text-muted-foreground text-sm mb-6">{course.description}</p>

      <div className="space-y-3 mb-6 pb-6 border-b border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Monthly Fee</span>
          <span className="font-semibold text-foreground">{course.monthly}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Registration (One-time)</span>
          <span className="font-semibold text-foreground">
            {course.registration}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-baseline mb-6">
        <span className="text-foreground font-medium">Total Enrollment</span>
        <span className="font-display text-2xl font-bold text-primary">
          {course.total}
        </span>
      </div>

      <ul className="space-y-2 mb-8 text-sm text-muted-foreground flex-1">
        <li className="flex items-start gap-2">
          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          Recordings of every class
        </li>
        <li className="flex items-start gap-2">
          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          Digital notations & study material
        </li>
        <li className="flex items-start gap-2">
          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          Personal guidance from the Guru
        </li>
      </ul>

      <Button variant={course.highlight ? "hero" : "outline"} asChild>
        {isInternal ? (
          <Link to={ctaHref}>{ctaLabel}</Link>
        ) : (
          <a href={ctaHref}>{ctaLabel}</a>
        )}
      </Button>
    </Card>
  );
};

export default CourseCard;
