import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai, India",
    rating: 5,
    text: "Learning Hindustani classical music with Sur Samyam has been a transformative experience. The patience and depth of knowledge shown in each lesson is remarkable.",
    avatar: "PS",
  },
  {
    id: 2,
    name: "Rahul Verma",
    location: "Delhi, India",
    rating: 5,
    text: "I started as a complete beginner and now I can confidently perform basic ragas. The teaching methodology is perfect for working professionals like me.",
    avatar: "RV",
  },
  {
    id: 3,
    name: "Anita Desai",
    location: "Bangalore, India",
    rating: 5,
    text: "The online classes are so well-structured. I love how each raga is explained with its emotional context and the proper technique to bring out its essence.",
    avatar: "AD",
  },
  {
    id: 4,
    name: "Vikram Patel",
    location: "Pune, India",
    rating: 5,
    text: "My daughter has been learning for 6 months now and her progress is incredible. The teacher's ability to connect with young students is wonderful.",
    avatar: "VP",
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Student Stories
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            What Our Students Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from students who have embarked on their musical journey with us
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="relative max-w-4xl mx-auto">
          {/* Background decorative elements */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gold/5 rounded-full blur-3xl" />

          {/* Main testimonial card */}
          <div className="relative bg-card border border-border/50 rounded-3xl p-8 md:p-12 shadow-soft">
            {/* Quote icon */}
            <div className="absolute -top-6 left-8 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Quote className="w-6 h-6 text-primary-foreground" />
            </div>

            {/* Content */}
            <div className="pt-4">
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-gold text-gold" />
                ))}
              </div>

              {/* Quote text */}
              <blockquote className="text-lg md:text-xl text-foreground/90 leading-relaxed mb-8 min-h-[100px]">
                "{testimonials[currentIndex].text}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
                    {testimonials[currentIndex].avatar}
                  </div>
                  <div>
                    <div className="font-display font-semibold text-foreground">
                      {testimonials[currentIndex].name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonials[currentIndex].location}
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevTestimonial}
                    className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextTestimonial}
                    className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-primary w-8"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
