import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, GraduationCap } from "lucide-react";
import teacherImage from "@/assets/teacher.jpg";

const placeholderImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#7B848C" />
          <stop offset="100%" stop-color="#5A6268" />
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#bg)"/>
      <circle cx="400" cy="330" r="110" fill="#DDE2E6" opacity="0.9"/>
      <path d="M240 790c26-144 124-220 160-220s134 76 160 220" fill="#C9D0D5" opacity="0.85"/>
    </svg>
  `);

const teachers = [
  {
    name: "A Teacher Who is Also a Student",
    role: "Hindustani Vocal — 10+ Years",
    bio: "With over a decade of dedicated practice in Hindustani classical vocal music, I believe that teaching and learning are two sides of the same coin. Every lesson I give is also a lesson I receive.",
    image: teacherImage,
    imageAlt: "Singing teacher portrait",
    overlayBadges: [
      { label: "Passionate", icon: Heart, className: "bg-primary/90 text-primary-foreground" },
      { label: "Ever-Learning", icon: GraduationCap, className: "bg-gold/90 text-foreground" },
    ],
    statBadges: ["10+ Years Practice", "100+ Students", "Beginner Friendly"],
  },
  {
    name: "Teacher Name",
    role: "Hindustani Vocal — Joining Soon",
    bio: "Bio coming soon — another passionate guide joining the Sur Samyam family.",
    image: placeholderImage,
    imageAlt: "Placeholder portrait for upcoming teacher",
    overlayBadges: [],
    statBadges: ["Warm Guidance", "Coming Soon", "Beginner Friendly"],
  },
];

const TeacherSection = () => {
  return (
    <section id="teacher" className="py-16 lg:py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-[880px]">
          <div className="mb-12 text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              Your Guide
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Meet Your Teachers
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
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
    overlayBadges: Array<{
      label: string;
      icon: typeof Heart;
      className: string;
    }>;
    statBadges: string[];
  };
}) {
  return (
    <div className="box-border flex h-auto min-w-0 w-full max-w-[420px] flex-1 flex-col rounded-2xl border-[1.5px] border-[#C9922A] bg-[#1B4D3E] p-4 md:basis-0">
      <div className="relative mb-3 h-[260px] w-full overflow-hidden rounded-[10px]">
        <img
          src={teacher.image}
          alt={teacher.imageAlt}
          className="block h-full w-full rounded-[10px] border-2 border-[#C9922A] object-cover object-top"
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

      <h3 className="mb-[0.4rem] text-[1.2rem] font-bold text-foreground">{teacher.name}</h3>
      <p className="mb-2.5 text-[0.9rem] italic text-[#C9922A]">{teacher.role}</p>
      <p className="mb-3 text-[0.875rem] leading-relaxed text-muted-foreground">{teacher.bio}</p>

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

      <Button variant="warm" size="lg" className="mt-auto w-full" asChild>
        <a href="#contact">Schedule a Chat</a>
      </Button>
    </div>
  );
}

export default TeacherSection;
