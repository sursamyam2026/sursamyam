import { Card, CardContent } from "@/components/ui/card";
import { BookOpenCheck, Mic2, ShieldCheck, UserRoundCheck } from "lucide-react";

const AboutMusicSection = () => {
  const aboutHighlights = [
    {
      icon: UserRoundCheck,
      title: "Personalised Focus",
      description: "Every student receives equal and individual attention, ensuring steady and meaningful growth in their musical journey.",
      color: "text-[#C9922A]",
      bgColor: "bg-[#F5ECD7]",
    },
    {
      icon: Mic2,
      title: "Performance Opportunities",
      description: "Regular platforms to perform and build the confidence that only a stage can offer.",
      color: "text-[#C9922A]",
      bgColor: "bg-[#F5ECD7]",
    },
    {
      icon: BookOpenCheck,
      title: "Examination Guidance",
      description: "Dedicated support and preparation for students who wish to pursue Hindustani classical music through formal examinations.",
      color: "text-[#C9922A]",
      bgColor: "bg-[#F5ECD7]",
    },
    {
      icon: ShieldCheck,
      title: "Quality Over Quantity",
      description: "We are not a commercial academy. Our focus is on sincere, in-depth learning rooted in the true tradition of Hindustani classical music.",
      color: "text-[#C9922A]",
      bgColor: "bg-[#F5ECD7]",
    },
  ];

  return (
    <>
      <div className="bg-[#FDF6EC] px-8 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <span className="mb-4 inline-block rounded-full border border-[#C9922A] bg-[#F5ECD7] px-4 py-1 text-[0.8rem] font-medium text-[#5C3A00]">
                About Us
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                About Sur Samyam School of Music
              </h2>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1.45fr_0.9fr] lg:items-start">
              <div className="space-y-6 text-[#4A5E52]">
                <p className="text-lg leading-relaxed">
                  Sur Samyam was born from a deep longing - to
                  <span className="font-semibold text-[#1B4D3E]"> keep the soul of Hindustani classical music alive and thriving</span>.
                  More than an academy, we are a sacred space where
                  <span className="font-semibold text-[#C9922A]"> every student is valued equally</span>
                  and nurtured with wholehearted dedication. Founded by teachers driven by vision and devotion, our mission is to spread the love for this timeless art form.
                  <span className="font-semibold text-[#1B4D3E]"> We do not chase numbers - we chase excellence.</span>
                </p>
                <p className="text-lg leading-relaxed">
                  Sur Samyam is more than a music school - it is a
                  <span className="font-semibold text-[#1B4D3E]"> complete musical home</span>.
                  We offer
                  <span className="font-semibold text-[#C9922A]"> dedicated guidance</span>
                  for students who wish to appear for classical music examinations, ensuring they are well-prepared and confident. We also believe that
                  <span className="font-semibold text-[#1B4D3E]"> true learning comes alive on stage</span>,
                  which is why we create meaningful performance opportunities for our students to showcase their gayaki, build confidence, and experience the joy of sharing music with an audience.
                </p>
              </div>

              <Card variant="glass" className="rounded-3xl bg-white p-8">
                <blockquote className="text-xl italic leading-relaxed text-foreground">
                  "Our mission is to nurture a deep love for Hindustani classical music by providing every student with equal attention, sincere guidance, and a space to grow."
                </blockquote>
              </Card>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {aboutHighlights.map((feature, index) => (
                <Card
                  key={feature.title}
                  variant="elevated"
                  className="group p-6 text-center"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-0 space-y-4">
                    <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-[#1B4D3E]">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#4A5E52]">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutMusicSection;
