import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutMusicSection from "@/components/AboutMusicSection";
import TeacherSection from "@/components/TeacherSection";
import ClassesSection from "@/components/ClassesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import SectionDivider from "@/components/SectionDivider";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <Navbar />
      <main id="top">
        <HeroSection />
        <SectionDivider />
        <section id="about" className="scroll-mt-[75px] bg-[#FDF6EC]">
          <AboutMusicSection />
        </section>
        <SectionDivider />
        <ClassesSection />
        <SectionDivider />
        <TeacherSection />
        <SectionDivider />
        <section id="testimonials" className="scroll-mt-[100px] bg-[#FDF6EC]">
          <TestimonialsSection />
        </section>
        <SectionDivider />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
