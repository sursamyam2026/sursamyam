import { Badge } from "@/components/ui/badge";
import { Heart, GraduationCap } from "lucide-react";
import sonalinImage from "@/assets/teacher-sonalin.jpeg";
import shravanthiImage from "@/assets/teacher-shravanthi.jpeg";

const teachers = [
  {
    name: "Sonalin Subhadarshini",
    role: "A Lifelong Student of the Craft",
    bio: "An MBA by education and a musician by passion, she founded Sur Samyam with a clear vision to build a new age system for an age old craft. With over a decade of dedicated practice in Hindustani classical vocal music, she leads every class as both a teacher and a forever student, knowing that the deeper you go into this art, the more it has to offer.",
    image: sonalinImage,
    imageAlt: "Sonalin Subhadarshini portrait",
    imagePosition: "50% 12%",
    overlayBadges: [
      { label: "Passionate", icon: Heart, className: "border border-[#C9922A] bg-[#FDF6EC] text-[#C9922A]" },
      { label: "Ever-Learning", icon: GraduationCap, className: "border border-[#C9922A] bg-[#FDF6EC] text-[#C9922A]" },
    ],
    statBadges: ["10+ Years Practice", "Warm Guidance", "Beginner Friendly"],
  },
  {
    name: "Shravanthi S Karli",
    role: "Carrying a Legacy, One Student at a Time",
    bio: "For her, music is not just an art but her inheritance. Raised in a household where Hindustani classical music was a way of life, she brings over a decade of teaching experience and a deeply personal mission to Sur Samyam - to keep her family's musical tradition alive and share its beauty with every student who walks through the door.",
    image: shravanthiImage,
    imageAlt: "Shravanthi S Karli portrait",
    imagePosition: "50% 38%",
    overlayBadges: [
      { label: "Legacy-Led", icon: Heart, className: "border border-[#C9922A] bg-[#FDF6EC] text-[#C9922A]" },
      { label: "Experienced", icon: GraduationCap, className: "border border-[#C9922A] bg-[#FDF6EC] text-[#C9922A]" },
    ],
    statBadges: ["100+ Students", "Tradition Rooted", "Beginner Friendly"],
  },
];

const TeacherSection = () => {
  return (
    <section id="teacher" className="scroll-mt-[75px] bg-[#FDF6EC] px-8 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-[880px]">
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block rounded-full border border-[#C9922A] bg-[#F5ECD7] px-4 py-1 text-[0.8rem] font-medium text-[#5C3A00]">
              Your Guide
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Meet Your Teachers
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[#4A5E52]">
              Two passionate guides, one shared love for music
            </p>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:justify-center">
            <TeacherCard teacher={teachers[0]} />

            <div className="relative flex w-full items-center justify-center md:w-auto md:self-stretch">
              <div className="h-px w-full bg-[#C9922A] md:h-auto md:w-px md:flex-1" />
              <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background text-sm text-[#C9922A]">
                ♪
              </div>
            </div>

            <TeacherCard teacher={teachers[1]} />
          </div>
        </div>
      </div>
    </section>
  );
};

function TeacherCard({
  teacher,
}: {
  teacher: {
    name: string;
    role: string;
    bio: string;
    image: string;
    imageAlt: string;
    imagePosition: string;
    overlayBadges: Array<{
      label: string;
      icon: typeof Heart;
      className: string;
    }>;
    statBadges: string[];
  };
}) {
  return (
    <div className="box-border flex h-auto min-w-0 w-full max-w-[420px] flex-1 flex-col rounded-[12px] border-[1.5px] border-[#C9922A] bg-white p-5 md:basis-0">
      <div className="relative mb-3 h-[360px] w-full overflow-hidden rounded-[10px] border-2 border-[#C9922A]">
        <img
          src={teacher.image}
          alt={teacher.imageAlt}
          className="block h-full w-full object-cover"
          style={{ objectPosition: teacher.imagePosition }}
        />
        {teacher.overlayBadges.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
            {teacher.overlayBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <Badge key={badge.label} className={badge.className}>
                  <Icon className="mr-1 h-3 w-3" />
                  {badge.label}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <h3 className="mb-[0.4rem] text-[1.2rem] font-bold text-[#1B4D3E]">{teacher.name}</h3>
      <p className="mb-2.5 text-[0.9rem] italic text-[#C9922A]">{teacher.role}</p>
      <p className="mb-3 text-[0.875rem] leading-relaxed text-[#4A5E52]">{teacher.bio}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {teacher.statBadges.map((badge) => (
          <span
            key={badge}
            className="rounded-full border border-[#C9922A] px-[10px] py-[3px] text-[0.75rem] text-[#C9922A]"
          >
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}

export default TeacherSection;
