import { Button } from "@/components/ui/button";
import { Images, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FDF6EC] px-8 py-20 pt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})`, backgroundPosition: '70% center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDF6EC]/95 via-[#FDF6EC]/90 to-[#FDF6EC]/95" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 rounded-full bg-primary/20 blur-3xl animate-pulse-slow" />

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex animate-scale-in items-center gap-2 rounded-full border border-[#C9922A] bg-[#F5ECD7] px-4 py-1 text-[0.8rem]">
            <Sparkles className="h-4 w-4 text-[#5C3A00]" />
            <span className="text-sm font-medium text-[#5C3A00]">Begin Your Musical Journey</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up font-display text-4xl font-bold leading-tight text-[#1B4D3E] sm:text-5xl md:text-6xl lg:text-7xl" style={{ animationDelay: '0.1s' }}>
            Discover the Magic of{" "}
            <span className="text-[#C9922A]">Hindustani</span>{" "}
            <span className="relative inline-block">
              Classical Music
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0 6 Q50 0, 100 6 T200 6" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-2xl animate-fade-up text-lg text-[#4A5E52] md:text-xl" style={{ animationDelay: '0.2s' }}>
            Embark on a soulful journey through ragas and talas. Learn from a passionate teacher 
            who is also a dedicated student of this ancient art form.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="lg" className="text-[#1B1100]" asChild>
              <a href="#contact">Book a Trial Class</a>
            </Button>
            <Button variant="outline" size="lg" className="group border-[#C9922A] bg-white/80 text-[#1B4D3E]" asChild>
              <Link to="/gallery">
                <Images className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Gallery
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 pt-0 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold text-primary">100+</div>
              <div className="text-sm text-[#4A5E52]">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold text-primary">10+</div>
              <div className="text-sm text-[#4A5E52]">Years Learning</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold text-primary">50+</div>
              <div className="text-sm text-[#4A5E52]">Ragas Taught</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
