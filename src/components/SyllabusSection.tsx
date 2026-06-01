import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Check, Headphones, ListMusic, Mic2, Music2, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const syllabusItems = [
  {
    icon: Mic2,
    title: "Voice Culture",
    description: "Build a steady, expressive voice through focused daily practice.",
    points: ["Swar practice", "Breath control", "Pitch stability", "Daily riyaz habits"],
  },
  {
    icon: Music2,
    title: "Raga Study",
    description: "Understand the personality, movement, and mood of each raga.",
    points: ["Aroha and avaroha", "Pakad and chalan", "Alaap development", "Bandish learning"],
  },
  {
    icon: ListMusic,
    title: "Tala and Laya",
    description: "Develop rhythmic confidence through claps, cycles, and tempo awareness.",
    points: ["Basic talas", "Clap patterns", "Layakari awareness", "Rhythm confidence"],
  },
  {
    icon: BookOpen,
    title: "Theory and Listening",
    description: "Connect practical singing with musical grammar and guided listening.",
    points: ["Swar gyan", "Raga grammar", "Notation basics", "Guided listening"],
  },
  {
    icon: Trophy,
    title: "Exam and Stage Prep",
    description: "Prepare for formal evaluations and meaningful performance moments.",
    points: ["Syllabus revision", "Mock performance", "Confidence building", "Presentation skills"],
  },
];

const learningStages = [
  "Foundation",
  "Raga Development",
  "Performance Readiness",
];

const SyllabusSection = () => {
  return (
    <section id="syllabus" className="scroll-mt-[75px] bg-[#FDF6EC] px-8 pb-20 pt-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C9922A] bg-[#F5ECD7] px-4 py-1 text-[0.8rem] font-medium text-[#5C3A00]">
                <Sparkles className="h-4 w-4" />
                Syllabus
              </span>
              <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-[#1B4D3E] md:text-5xl lg:text-6xl">
                A complete path for musical growth
              </h1>
              <p className="max-w-3xl text-lg leading-relaxed text-[#4A5E52]">
                Our syllabus balances riyaz, raga understanding, tala, theory, and performance preparation so every student grows with clarity and confidence.
              </p>
            </div>

            <div className="rounded-[24px] border-[1.5px] border-[#C9922A] bg-white p-6 shadow-md">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5ECD7]">
                  <Headphones className="h-6 w-6 text-[#C9922A]" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-[#1B4D3E]">Learning Journey</h2>
                  <p className="text-sm text-[#4A5E52]">Structured, patient, and performance-aware.</p>
                </div>
              </div>
              <div className="space-y-3">
                {learningStages.map((stage, index) => (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5ECD7] text-sm font-semibold text-[#8B621D]">
                      {index + 1}
                    </span>
                    <span className="font-medium text-[#1B4D3E]">{stage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto flex max-w-5xl flex-col gap-6">
            {syllabusItems.map((item, index) => (
              <Card
                key={item.title}
                variant="elevated"
                className={`w-full bg-white p-6 md:w-[72%] ${
                  index % 2 === 0 ? "md:self-start" : "md:self-end"
                }`}
              >
                <CardContent className="p-0">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5ECD7]">
                      <item.icon className="h-7 w-7 text-[#C9922A]" />
                    </div>
                    <span className="rounded-full border border-[#E8D5A3] px-3 py-1 text-xs font-medium text-[#8B621D]">
                      Core
                    </span>
                  </div>
                  <h3 className="mb-4 font-display text-xl font-semibold text-[#1B4D3E]">
                    {item.title}
                  </h3>
                  <p className="mb-5 text-sm leading-6 text-[#4A5E52]">{item.description}</p>
                  <ul className="space-y-3">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-center gap-3 text-sm text-[#4A5E52]">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#F5ECD7]">
                          <Check className="h-3 w-3 text-[#C9922A]" />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-14 grid gap-6 rounded-[28px] border border-[#E8D5A3] bg-[#F5ECD7] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div>
              <h2 className="mb-2 font-display text-2xl font-semibold text-[#1B4D3E]">
                Ready to choose your learning path?
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-[#4A5E52]">
                Explore class formats and pick the course that matches your age, schedule, and goals.
              </p>
            </div>
            <Button variant="hero" className="w-full text-[#1B1100] md:w-auto" asChild>
              <Link to="/registration/course-details">View Courses</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SyllabusSection;
