import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Manmayee",
    location: "Bangalore",
    rating: 5,
    text: "I have recently joined Hindustani music classes with Sur Samyam, and I must say it has been a wonderful experience. After every class, I feel incredibly calm and fulfilled. There is so much to learn, and each session is truly enriching. The faculty is very patient when it comes to clearing doubts and explains concepts with great care. What I appreciate the most is how they understand where I am lacking and put in genuine effort to help me improve. Sur Samyam's teachers are highly experienced and passionate about teaching, which reflects in every class. I would definitely recommend Sur Samyam to anyone interested in learning Hindustani music.",
    avatar: "M",
  },
  {
    id: 2,
    name: "Nesara",
    location: "Bangalore",
    rating: 5,
    text: "Being a student of Sur Samyam for the past five years has been an incredibly rewarding experience. The guidance has helped me connect with the raags and strengthened confidence in my abilities. Great care is taken to ensure that every concept is clearly understood, and the teaching style is adapted to suit my pace while motivating me on days when I am not able to give my best. I'm very grateful to have had this experience for so many years and would highly recommend Sur Samyam to anyone looking to build a strong foundation in music and an enjoyable music journey.",
    avatar: "N",
  },
  {
    id: 3,
    name: "Arun Kumar",
    location: "Bangalore",
    rating: 5,
    text: "I started to learn Hindustani Classical Vocals in my late fifties. The guidance and patience to teach me from scratch at this age matters a lot! Break all the myths start learning music to keep the happiness around.",
    avatar: "AK",
  },
  {
    id: 4,
    name: "Diya",
    location: "Bangalore",
    rating: 5,
    text: "Our son Ishaan is learning Hindustani classical with Sur Samyam. We are extremely happy with the progress. The faculty is very dedicated and patient with Ishaan, who is six years old. Ishaan is learning with great enthusiasm and ample amount of interest. Concepts are explained clearly even when repeated, leading to significant progress. The lessons are engaging and fun-filled, creating a supportive teaching environment. Sur Samyam shares notes online along with videos of Ishaan's singing. Along with singing, he is also taught to play musical instruments. Thank you Sur Samyam for your patience and dedication.",
    avatar: "D",
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const currentTestimonial = testimonials[currentIndex];
  const hasLongText = currentTestimonial.text.length > 260;

  useEffect(() => {
    setIsExpanded(false);
  }, [currentIndex]);

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
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-gold text-gold" />
                ))}
              </div>

              {/* Quote text */}
              <div className="mb-8">
                <div className="relative">
                  <blockquote
                    className={`min-h-[100px] text-lg leading-relaxed text-[#4A5E52] md:text-xl ${
                      hasLongText && !isExpanded ? "max-h-[120px] overflow-hidden md:max-h-[135px]" : ""
                    }`}
                  >
                    "{currentTestimonial.text}"
                  </blockquote>
                  {hasLongText && !isExpanded && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white via-white/90 to-white/0" />
                  )}
                </div>
                {hasLongText && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded((value) => !value)}
                    className="mt-3 inline-flex h-9 items-center rounded-full border border-[#C9922A] bg-[#F5ECD7] px-4 text-sm font-semibold text-[#1B4D3E] transition-colors hover:bg-[#E8D5A3]"
                  >
                    {isExpanded ? "Show less" : "Read full story"}
                  </button>
                )}
              </div>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5ECD7] font-display text-lg font-bold text-[#C9922A]">
                    {currentTestimonial.avatar}
                  </div>
                  <div>
                    <div className="font-display font-semibold text-[#1B4D3E]">
                      {currentTestimonial.name}
                    </div>
                    <div className="text-sm text-[#7A8C7E]">
                      {currentTestimonial.location}
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
