import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Users, Video, MapPin, Check, Sparkles, Star, Music } from "lucide-react";
import { cn } from "@/lib/utils";

type AgeGroup = "kids" | "adults";

const classesByGroup: Record<
  AgeGroup,
  Array<{
    title: string;
    description: string;
    icon: typeof User;
    features: string[];
    badge?: { label: string; icon: typeof Sparkles };
    featured?: boolean;
  }>
> = {
  kids: [
    {
      title: "Individual Sessions (Kids)",
      description: "Fun, age-appropriate one-on-one lessons designed for young learners",
      icon: User,
      features: [
        "Short sessions suited for kids' attention spans",
        "Focus on basic ragas, rhythm, and playful activities",
        "Parental progress updates included",
        "Encouraging, patient guidance",
      ],
    },
    {
      title: "Group Sessions (Kids)",
      description: "Interactive, activity-based classes that build confidence and friendships",
      icon: Users,
      features: [
        "Small batches of 4–6 children",
        "Fun group music games and performances",
        "Builds confidence and peer bonding",
        "Activity-based learning approach",
      ],
      featured: true,
      badge: { label: "Great for Beginners", icon: Star },
    },
  ],
  adults: [
    {
      title: "Individual Sessions (Adults)",
      description: "One-on-one personalized lessons tailored to your pace and goals",
      icon: User,
      features: [
        "Personalized curriculum",
        "Flexible scheduling",
        "Hobby, performance, or advanced learning focus",
        "Direct feedback and guidance",
      ],
    },
    {
      title: "Group Sessions (Adults)",
      description: "Learn together with fellow enthusiasts in a supportive community",
      icon: Users,
      features: [
        "Small batch sizes (4–6)",
        "Peer learning experience",
        "Affordable pricing",
        "Fun group activities",
      ],
      featured: true,
      badge: { label: "Popular Choice", icon: Sparkles },
    },
  ],
};

const ClassesSection = () => {
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("adults");

  const formats = [
    {
      title: "Online Classes",
      description: "Learn from the comfort of your home via high-quality video calls",
      icon: Video,
      benefits: ["Flexible timings", "No commute", "Recording available", "Global access"],
    },
    {
      title: "In-Person Classes",
      description: "Experience the traditional guru-shishya setting face to face",
      icon: MapPin,
      benefits: ["Direct interaction", "Traditional setting", "Real-time corrections", "Community feel"],
    },
  ];

  const tabs: { value: AgeGroup; label: string; sub: string; icon: typeof User }[] = [
    { value: "kids", label: "For Kids", sub: "Age 6–14", icon: Music },
    { value: "adults", label: "For Adults", sub: "Age 15+", icon: User },
  ];

  const activeClasses = classesByGroup[ageGroup];

  return (
    <section id="classes" className="scroll-mt-[100px] bg-[#FDF6EC] px-8 pt-16 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="mb-4 inline-block rounded-full border border-[#C9922A] bg-[#F5ECD7] px-4 py-1 text-[0.8rem] font-medium text-[#5C3A00]">
              Classes
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Find Your Perfect Learning Path
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[#4A5E52]">
              Tailored programs for every age — choose the experience that fits you best.
            </p>
          </div>

          {/* Age Group Tabs */}
          <div className="flex justify-center mb-12">
            <div role="tablist" aria-label="Age group" className="flex flex-row flex-wrap justify-center gap-5 rounded-full bg-[#F5ECD7] p-1">
              {tabs.map((tab) => {
                const active = ageGroup === tab.value;
                const TabIcon = tab.icon;

                return (
                  <button
                    key={tab.value}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setAgeGroup(tab.value)}
                    className={cn(
                      "flex w-[160px] flex-col items-center justify-center rounded-[24px] border-[1.5px] px-4 py-3 text-center transition-all duration-300 ease-out",
                      active
                        ? "scale-105 border-transparent bg-[#C9922A] text-[#1B1100] shadow-[0_14px_30px_-12px_rgba(201,146,42,0.75)]"
                        : "border-[#C9922A] bg-white text-[#1B4D3E] hover:bg-white",
                    )}
                  >
                    <TabIcon
                      className={cn(
                        "mb-2 h-5 w-5 transition-colors duration-300",
                        active ? "text-[#1B1100]" : "text-[#1B4D3E]",
                      )}
                    />
                    <span className="text-[0.95rem] font-semibold leading-none">{tab.label}</span>
                    <span
                      className={cn(
                        "mt-2 text-[0.75rem] leading-none transition-colors duration-300",
                        active ? "text-[#1B1100]/80" : "text-[#1B4D3E]",
                      )}
                    >
                      {tab.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Class Cards */}
          <div key={ageGroup} className="grid md:grid-cols-2 gap-8 mb-16 animate-fade-up">
            {activeClasses.map((classType) => {
              const BadgeIcon = classType.badge?.icon;
              return (
                <Card
                  key={classType.title}
                  variant={classType.featured ? "featured" : "elevated"}
                  className="relative overflow-hidden bg-white"
                >
                  {classType.badge && BadgeIcon && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-primary to-gold text-primary-foreground">
                        <BadgeIcon className="w-3 h-3 mr-1" />
                        {classType.badge.label}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5ECD7]">
                      <classType.icon className="h-7 w-7 text-[#C9922A]" />
                    </div>
                    <CardTitle className="text-2xl text-[#1B4D3E]">{classType.title}</CardTitle>
                    <CardDescription className="text-base text-[#4A5E52]">{classType.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {classType.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-[#4A5E52]">
                          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#F5ECD7]">
                            <Check className="h-3 w-3 text-[#C9922A]" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button variant="hero" className="w-full text-[#1B1100]" asChild>
                      <a href="#contact">Learn More</a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="-mx-4 mt-4 bg-[#FDF6EC] px-4 py-16 sm:rounded-[32px]">
            <div className="text-center mb-10">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Choose Your Format
              </h3>
              <p className="text-[#4A5E52]">
                Both individual and group sessions are available in these formats
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {formats.map((format) => (
                <Card key={format.title} variant="warm" className="bg-white p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#F5ECD7]">
                      <format.icon className="h-6 w-6 text-[#C9922A]" />
                    </div>
                    <div>
                      <h4 className="font-display text-xl font-semibold text-[#1B4D3E] mb-2">
                        {format.title}
                      </h4>
                      <p className="mb-4 text-sm text-[#4A5E52]">{format.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {format.benefits.map((benefit) => (
                          <Badge key={benefit} variant="outline" className="font-normal">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClassesSection;
