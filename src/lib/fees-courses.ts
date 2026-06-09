import type { Course } from "@/components/fees/CourseCard";

export type FeeTrack = "adults" | "kids";
export type CourseFormat = "online" | "offline";

/** Numeric amounts in INR (rupees) for checkout math */
export interface FeeCourse {
  name: string;
  track: FeeTrack;
  monthlyRupee: number;
  monthlyRupeeByFormat: Record<CourseFormat, number>;
  registrationRupee: number;
  description: string;
  highlight?: boolean;
}

export function formatRupee(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export const adultCourses: FeeCourse[] = [
  {
    name: "One-on-One",
    track: "adults",
    monthlyRupee: 5000,
    monthlyRupeeByFormat: { online: 5000, offline: 5000 },
    registrationRupee: 1000,
    description: "8 classes per month – 1 Hour each.",
    highlight: true,
  },
  {
    name: "Group",
    track: "adults",
    monthlyRupee: 2500,
    monthlyRupeeByFormat: { online: 2500, offline: 2500 },
    registrationRupee: 1000,
    description: "8 classes per month – 1 Hour each.",
  },
];

export const kidsCourses: FeeCourse[] = [
  {
    name: "One-on-One",
    track: "kids",
    monthlyRupee: 5000,
    monthlyRupeeByFormat: { online: 5000, offline: 5000 },
    registrationRupee: 1000,
    description: "8 classes per month – 1 Hour each.",
    highlight: true,
  },
  {
    name: "Group",
    track: "kids",
    monthlyRupee: 2500,
    monthlyRupeeByFormat: { online: 2500, offline: 2500 },
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

export function getMonthlyRupee(c: FeeCourse, format: CourseFormat): number {
  return c.monthlyRupeeByFormat[format] ?? c.monthlyRupee;
}

/** For existing CourseCard / fees pages */
export function toCourseCardFormat(c: FeeCourse): Course {
  const onlineTotal = getMonthlyRupee(c, "online") + c.registrationRupee;
  const offlineTotal = getMonthlyRupee(c, "offline") + c.registrationRupee;
  return {
    name: c.name,
    monthly: formatRupee(getMonthlyRupee(c, "online")),
    monthlyByFormat: {
      online: formatRupee(getMonthlyRupee(c, "online")),
      offline: formatRupee(getMonthlyRupee(c, "offline")),
    },
    registration: formatRupee(c.registrationRupee),
    total: formatRupee(onlineTotal),
    totalByFormat: {
      online: formatRupee(onlineTotal),
      offline: formatRupee(offlineTotal),
    },
    description: c.description,
    highlight: c.highlight,
    ctaLabel: "Enroll Now",
    ctaHref: `/student/enroll?track=${c.track}&course=${encodeURIComponent(c.name)}`,
  };
}
