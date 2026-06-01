import { Card, CardContent } from "@/components/ui/card";
import { Music2, Heart, Sun, Moon } from "lucide-react";

const AboutMusicSection = () => {
  const features = [
    {
      icon: Music2,
      title: "Ragas",
      description: "Melodic frameworks that evoke specific emotions and times of day, forming the soul of Hindustani music.",
      color: "text-[#C9922A]",
      bgColor: "bg-[#F5ECD7]",
    },
    {
      icon: Heart,
      title: "Bhav",
      description: "The emotional expression and devotion that transforms notes into a spiritual experience.",
      color: "text-[#C9922A]",
      bgColor: "bg-[#F5ECD7]",
    },
    {
      icon: Sun,
      title: "Talas",
      description: "Rhythmic cycles that provide structure and foundation for melodic improvisation.",
      color: "text-[#C9922A]",
      bgColor: "bg-[#F5ECD7]",
    },
    {
      icon: Moon,
      title: "Alap",
      description: "The meditative, unmetered exploration of a raga, revealing its essence note by note.",
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
                  Sur Samyam was born from a deep longing - to keep the soul of Hindustani classical music alive and thriving. More than an academy, we are a sacred space where every student is valued equally and nurtured with wholehearted dedication. Founded by teachers driven by vision and devotion, our mission is to spread the love for this timeless art form. We do not chase numbers - we chase excellence.
                </p>
                <p className="leading-relaxed">
                  Sur Samyam is more than a music school - it is a complete musical home. We offer dedicated guidance for students who wish to appear for classical music examinations, ensuring they are well-prepared and confident. We also believe that true learning comes alive on stage, which is why we create meaningful performance opportunities for our students to showcase their gayaki, build confidence, and experience the joy of sharing music with an audience.
                </p>
              </div>

              <Card variant="glass" className="rounded-3xl bg-white p-8">
                <blockquote className="font-display text-xl italic leading-relaxed text-foreground">
                  "Our mission is to nurture a deep love for Hindustani classical music by providing every student with equal attention, sincere guidance, and a space to grow."
                </blockquote>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <section id="music" className="scroll-mt-[75px] bg-[#FDF6EC] px-8 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="mb-4 inline-block rounded-full border border-[#C9922A] bg-[#F5ECD7] px-4 py-1 text-[0.8rem] font-medium text-[#5C3A00]">
              The Art Form
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              What is Hindustani Classical Music?
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-[#4A5E52]">
              A centuries-old tradition from North India that transforms the human voice into 
              an instrument of profound emotional expression and spiritual connection.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed text-[#4A5E52]">
                Hindustani classical music is one of the two major traditions of Indian classical music, 
                originating in the northern regions of the Indian subcontinent. It's not just music—it's 
                a <span className="text-primary font-semibold">meditation</span>, a 
                <span className="font-semibold text-[#1B4D3E]"> conversation with the divine</span>, and a 
                <span className="font-semibold text-[#C9922A]"> journey inward</span>.
              </p>
              <p className="leading-relaxed text-[#4A5E52]">
                Unlike Western music with its fixed compositions, Hindustani music emphasizes improvisation 
                within the framework of ragas (melodic modes) and talas (rhythmic cycles). Each raga has its 
                own personality, time of day, and emotional color—creating a living, breathing art form that's 
                different every time it's performed.
              </p>
              <p className="leading-relaxed text-[#4A5E52]">
                Whether you're drawn to the soulful khayal, the devotional bhajan, or the light classical 
                thumri, learning Hindustani music opens doors to centuries of wisdom and beauty.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-gold/10 rounded-3xl blur-3xl" />
              <Card variant="glass" className="relative rounded-3xl bg-white p-8">
                <blockquote className="font-display text-xl md:text-2xl text-foreground italic leading-relaxed">
                  "Music is the space between the notes. It is the silence that makes the sound beautiful."
                </blockquote>
                <footer className="mt-6 text-[#7A8C7E]">
                  — A principle at the heart of Hindustani music
                </footer>
              </Card>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
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
      </section>
    </>
  );
};

export default AboutMusicSection;
