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
    <section id="classes" className="scroll-mt-20 py-16 lg:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Classes
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Find Your Perfect Learning Path
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tailored programs for every age — choose the experience that fits you best.
            </p>
          </div>

          {/* Age Group Tabs */}
          <div className="flex justify-center mb-12">
            <div role="tablist" aria-label="Age group" className="flex flex-row flex-wrap justify-center gap-5">
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
                      "flex h-[90px] w-[180px] sm:w-[200px] flex-col items-center justify-center rounded-[24px] border text-center transition-all duration-300 ease-out",
                      active
                        ? "scale-105 border-[#C9922A] bg-[#C9922A] text-[#1B4D3E] shadow-[0_14px_30px_-12px_rgba(201,146,42,0.75)]"
                        : "border-[#C9922A] bg-[#1B4D3E] text-[#F8F3E7] opacity-75 hover:opacity-90",
                    )}
                  >
                    <TabIcon
                      className={cn(
                        "mb-2 h-5 w-5 transition-colors duration-300",
                        active ? "text-[#1B4D3E]" : "text-[#E0B765]",
                      )}
                    />
                    <span className="text-base font-semibold leading-none">{tab.label}</span>
                    <span
                      className={cn(
                        "mt-2 text-sm leading-none transition-colors duration-300",
                        active ? "text-[#1B4D3E]/80" : "text-[#E0B765]",
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
                  className="relative overflow-hidden"
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
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <classType.icon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{classType.title}</CardTitle>
                    <CardDescription className="text-base">{classType.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {classType.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-muted-foreground">
                          <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-accent" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button variant="hero" className="w-full" asChild>
                      <a href="#contact">Learn More</a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Learning Formats */}
          <div className="text-center mb-10">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Choose Your Format
            </h3>
            <p className="text-muted-foreground">
              Both individual and group sessions are available in these formats
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {formats.map((format) => (
              <Card key={format.title} variant="warm" className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center flex-shrink-0">
                    <format.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-semibold text-foreground mb-2">
                      {format.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">{format.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {format.benefits.map((benefit) => (
                        <Badge key={benefit} variant="secondary" className="font-normal">
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
    </section>
  );
};

export default ClassesSection;
