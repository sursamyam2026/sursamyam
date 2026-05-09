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
    <section className="overflow-hidden bg-[#FDF6EC] px-8 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="mb-4 inline-block rounded-full border border-[#C9922A] bg-[#F5ECD7] px-4 py-1 text-[0.8rem] font-medium text-[#5C3A00]">
            Student Stories
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            What Our Students Say
          </h2>
          <p className="mx-auto max-w-2xl text-[#4A5E52]">
            Hear from students who have embarked on their musical journey with us
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="relative max-w-4xl mx-auto">
          {/* Background decorative elements */}
          <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-gold/5 blur-3xl" />

          {/* Main testimonial card */}
          <div className="relative rounded-[12px] border-[1.5px] border-[#C9922A] bg-white p-8 shadow-soft md:p-12">
            {/* Quote icon */}
            <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5ECD7] shadow-lg">
              <Quote className="h-6 w-6 text-[#C9922A]" />
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
              <blockquote className="mb-8 min-h-[100px] text-lg leading-relaxed text-[#4A5E52] md:text-xl">
                "{testimonials[currentIndex].text}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5ECD7] font-display text-lg font-bold text-[#C9922A]">
                    {testimonials[currentIndex].avatar}
                  </div>
                  <div>
                    <div className="font-display font-semibold text-[#1B4D3E]">
                      {testimonials[currentIndex].name}
                    </div>
                    <div className="text-sm text-[#7A8C7E]">
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
                    className="rounded-full text-[#1B4D3E] transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextTestimonial}
                    className="rounded-full text-[#1B4D3E] transition-colors"
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
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-[#C9922A]"
                    : "bg-[#C9922A]/30 hover:bg-[#C9922A]/30"
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
