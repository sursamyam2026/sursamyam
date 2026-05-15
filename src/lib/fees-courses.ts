import type { Course } from "@/components/fees/CourseCard";

export type FeeTrack = "adults" | "kids";

/** Numeric amounts in INR (rupees) for checkout math */
export interface FeeCourse {
  name: string;
  track: FeeTrack;
  monthlyRupee: number;
  registrationRupee: number;
  description: string;
  highlight?: boolean;
}

export const CONVENIENCE_FEE_RUPEES = 150;

export function formatRupee(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export const adultCourses: FeeCourse[] = [
  {
    name: "One-on-One",
    track: "adults",
    monthlyRupee: 4000,
    registrationRupee: 1000,
    description: "8 classes per month – 1 Hour each.",
    highlight: true,
  },
  {
    name: "Group",
    track: "adults",
    monthlyRupee: 2000,
    registrationRupee: 1000,
    description: "8 classes per month – 1 Hour each.",
  },
];

export const kidsCourses: FeeCourse[] = [
  {
    name: "One-on-One",
    track: "kids",
    monthlyRupee: 4000,
    registrationRupee: 1000,
    description: "8 classes per month – 1 Hour each.",
    highlight: true,
  },
  {
    name: "Group",
    track: "kids",
    monthlyRupee: 2000,
    registrationRupee: 1000,
    description: "8 classes per month – 1 Hour each.",
  },
];

export function allCourses(): FeeCourse[] {
  return [...adultCourses, ...kidsCourses];
}

export function getCourse(track: FeeTrack, name: string): FeeCourse | undefined {
  const list = track === "adults" ? adultCourses : kidsCourses;
  return list.find((c) => c.name === name);
}

/** For existing CourseCard / fees pages */
export function toCourseCardFormat(c: FeeCourse): Course {
  const monthlyPlusReg = c.monthlyRupee + c.registrationRupee;
  return {
    name: c.name,
    monthly: formatRupee(c.monthlyRupee),
    registration: formatRupee(c.registrationRupee),
    total: formatRupee(monthlyPlusReg),
    description: c.description,
    highlight: c.highlight,
    ctaLabel: `Enroll`,
    ctaHref: `/student/enroll?track=${c.track}&course=${encodeURIComponent(c.name)}`,
  };
}
