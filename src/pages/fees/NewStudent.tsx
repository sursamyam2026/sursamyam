import { useEffect, useState } from "react";
import FeesPageLayout from "@/components/fees/FeesPageLayout";
import CourseCard from "@/components/fees/CourseCard";
import { Card } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import { leadsStore } from "@/lib/leads";
import { useStudentAuth } from "@/hooks/use-student-auth";
import {
  adultCourses as adultFeeCourses,
  kidsCourses as kidsFeeCourses,
  toCourseCardFormat,
} from "@/lib/fees-courses";

const adultCourses = adultFeeCourses.map(toCourseCardFormat);
const kidsCourses = kidsFeeCourses.map(toCourseCardFormat);

const NewStudent = () => {
  const location = useLocation();
  const { session } = useStudentAuth();
  const queryEmail =
    new URLSearchParams(location.search).get("email")?.trim().toLowerCase() ?? "";
  const studentEmail =
    session?.email.trim().toLowerCase() || queryEmail;
  const [rollNumber, setRollNumber] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    async function loadLead() {
      const lead = studentEmail ? await leadsStore.findByEmail(studentEmail) : null;
      if (!cancelled) {
        setRollNumber(lead?.rollNumber);
      }
    }

    void loadLead();
    return () => {
      cancelled = true;
    };
  }, [studentEmail]);

  return (
    <FeesPageLayout
      eyebrow="New Student"
      title="Select Your Course"
      description="Begin your journey into Hindustani classical music. Choose a course tailored for adults or kids."
    >
      <Card className="mb-8 p-6 max-w-2xl mx-auto">
        <p className="text-sm text-[#4A5E52]">Your Roll Number</p>
        {rollNumber ? (
          <p className="mt-2 text-3xl font-bold text-[#C9922A]">{rollNumber}</p>
        ) : (
          <p className="mt-2 text-[#4A5E52]">
            Roll number will be assigned upon enrollment confirmation
          </p>
        )}
      </Card>

      <div className="mb-16">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-6 text-center">
          For Adults
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {adultCourses.map((c) => (
            <CourseCard key={c.name} course={c} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-6 text-center">
          For Kids
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {kidsCourses.map((c) => (
            <CourseCard key={c.name} course={c} />
          ))}
        </div>
      </div>
    </FeesPageLayout>
  );
};

export default NewStudent;
