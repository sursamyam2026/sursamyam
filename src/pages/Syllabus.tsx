import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SyllabusSection from "@/components/SyllabusSection";

const Syllabus = () => {
  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <Navbar />
      <main className="pt-12">
        <SyllabusSection />
      </main>
      <Footer />
    </div>
  );
};

export default Syllabus;
