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
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <SectionDivider />
        <section id="about" className="scroll-mt-20">
          <AboutMusicSection />
        </section>
        <SectionDivider />
        <ClassesSection />
        <SectionDivider />
        <TeacherSection />
        <SectionDivider />
        <section id="testimonials" className="scroll-mt-20">
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
