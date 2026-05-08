import FeesPageLayout from "@/components/fees/FeesPageLayout";
import CourseCard, { Course } from "@/components/fees/CourseCard";

const adultCourses: Course[] = [
  {
    name: "Shadaj",
    monthly: "₹4,000",
    registration: "₹1,000",
    total: "₹5,000",
    description: "One-on-One class per week – 1 Hour.",
    highlight: true,
  },
  {
    name: "Pancham",
    monthly: "₹2,000",
    registration: "₹1,000",
    total: "₹3,000",
    description: "Two group classes per week – 1 Hour each.",
  },
];

const kidsCourses: Course[] = [
  {
    name: "Gandhar",
    monthly: "₹4,000",
    registration: "₹1,000",
    total: "₹5,000",
    description: "One-on-One class per week – 1 Hour.",
    highlight: true,
  },
  {
    name: "Nishad",
    monthly: "₹2,000",
    registration: "₹1,000",
    total: "₹3,000",
    description: "Two group classes per week – 1 Hour each.",
  },
];

const NewStudent = () => {
  return (
    <FeesPageLayout
      eyebrow="New Student"
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

export default NewStudent;
