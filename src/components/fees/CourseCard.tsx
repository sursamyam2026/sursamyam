import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, MapPin, Monitor } from "lucide-react";
import { Link } from "react-router-dom";
import type { CourseFormat } from "@/lib/fees-courses";

export interface Course {
  name: string;
  monthly: string;
  registration: string;
  total: string;
  description: string;
  monthlyByFormat?: Record<CourseFormat, string>;
  totalByFormat?: Record<CourseFormat, string>;
  highlight?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
}

const formatOptions: Array<{ value: CourseFormat; label: string; icon: typeof Monitor }> = [
  { value: "online", label: "Online", icon: Monitor },
  { value: "offline", label: "Offline", icon: MapPin },
];

const CourseCard = ({ course }: { course: Course }) => {
  const [format, setFormat] = useState<CourseFormat>("online");
  const ctaHref = useMemo(() => {
    const href = course.ctaHref ?? "/#contact";
    if (!href.startsWith("/") || href.startsWith("/#")) return href;

    const [path, query = ""] = href.split("?");
    const params = new URLSearchParams(query);
    params.set("format", format);
    return `${path}?${params.toString()}`;
  }, [course.ctaHref, format]);
  const ctaLabel = course.ctaLabel ?? `Enroll in ${course.name}`;
  const isInternal = ctaHref.startsWith("/") && !ctaHref.startsWith("/#");
  const monthly = course.monthlyByFormat?.[format] ?? course.monthly;
  const total = course.totalByFormat?.[format] ?? course.total;

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

      <div className="mb-6 rounded-2xl border border-[#E8D5A3] bg-[#FDF6EC] p-1">
        <div className="relative grid grid-cols-2">
          <span
            className={`absolute inset-y-0 left-0 w-1/2 rounded-[14px] bg-[#C9922A] shadow-sm transition-transform duration-300 ease-out ${
              format === "offline" ? "translate-x-full" : "translate-x-0"
            }`}
          />
          {formatOptions.map((option) => {
            const Icon = option.icon;
            const active = format === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormat(option.value)}
                aria-pressed={active}
                className={`relative z-10 flex min-h-11 items-center justify-center gap-2 rounded-[14px] px-3 text-sm font-semibold transition-colors ${
                  active ? "text-[#1B1100]" : "text-[#1B4D3E]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 mb-6 pb-6 border-b border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Monthly Fee</span>
          <span className="font-semibold text-foreground">{monthly}</span>
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
          {total}
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
