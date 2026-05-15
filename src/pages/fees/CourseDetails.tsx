import FeesPageLayout from "@/components/fees/FeesPageLayout";
import CourseCard from "@/components/fees/CourseCard";
import {
  adultCourses as adultFeeCourses,
  kidsCourses as kidsFeeCourses,
  toCourseCardFormat,
} from "@/lib/fees-courses";

const adultCourses = adultFeeCourses.map(toCourseCardFormat);
const kidsCourses = kidsFeeCourses.map(toCourseCardFormat);

const CourseDetails = () => {
  return (
    <FeesPageLayout
      eyebrow="Registration"
      title="Select Your Course"
      description="Begin your journey into Hindustani classical music. Choose a course tailored for adults or kids."
    >
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

export default CourseDetails;