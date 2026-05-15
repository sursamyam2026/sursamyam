import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ReactNode, useEffect } from "react";

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}

const FeesPageLayout = ({ eyebrow, title, description, children }: Props) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main id="fees-top" className="scroll-mt-[100px] flex-1 pt-24 lg:pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-3">
                {eyebrow}
              </p>
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {title}
              </h1>
              {description && (
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {description}
                </p>
              )}
            </div>
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FeesPageLayout;
