import { Card, CardContent } from "@/components/ui/card";
import { Music2, Heart, Sun, Moon } from "lucide-react";

const AboutMusicSection = () => {
  const features = [
    {
      icon: Music2,
      title: "Ragas",
      description: "Melodic frameworks that evoke specific emotions and times of day, forming the soul of Hindustani music.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Heart,
      title: "Bhav",
      description: "The emotional expression and devotion that transforms notes into a spiritual experience.",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: Sun,
      title: "Talas",
      description: "Rhythmic cycles that provide structure and foundation for melodic improvisation.",
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
    {
      icon: Moon,
      title: "Alap",
      description: "The meditative, unmetered exploration of a raga, revealing its essence note by note.",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <section id="music" className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              The Art Form
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              What is Hindustani Classical Music?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              A centuries-old tradition from North India that transforms the human voice into 
              an instrument of profound emotional expression and spiritual connection.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <p className="text-lg text-foreground leading-relaxed">
                Hindustani classical music is one of the two major traditions of Indian classical music, 
                originating in the northern regions of the Indian subcontinent. It's not just music—it's 
                a <span className="text-primary font-semibold">meditation</span>, a 
                <span className="text-secondary font-semibold"> conversation with the divine</span>, and a 
                <span className="text-gold font-semibold"> journey inward</span>.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Unlike Western music with its fixed compositions, Hindustani music emphasizes improvisation 
                within the framework of ragas (melodic modes) and talas (rhythmic cycles). Each raga has its 
                own personality, time of day, and emotional color—creating a living, breathing art form that's 
                different every time it's performed.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're drawn to the soulful khayal, the devotional bhajan, or the light classical 
                thumri, learning Hindustani music opens doors to centuries of wisdom and beauty.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-gold/10 rounded-3xl blur-3xl" />
              <Card variant="glass" className="relative p-8 rounded-3xl">
                <blockquote className="font-display text-xl md:text-2xl text-foreground italic leading-relaxed">
                  "Music is the space between the notes. It is the silence that makes the sound beautiful."
                </blockquote>
                <footer className="mt-6 text-muted-foreground">
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
                className="text-center p-6 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0 space-y-4">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMusicSection;
