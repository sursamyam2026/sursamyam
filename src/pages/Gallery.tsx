import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGallery } from "@/hooks/use-gallery";
import { ArrowLeft, Image as ImageIcon, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";

const Gallery = () => {
  const { images, isLoading, error } = useGallery();

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <Navbar />
      <main className="px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-5 rounded-[28px] border border-[#E8D5A3] bg-[linear-gradient(135deg,#F6E8C8_0%,#FDF6EC_55%,#F5ECD7_100%)] p-8 shadow-sm lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#C9922A]/40 bg-white/70 px-4 py-1 text-sm font-medium text-[#5C3A00]">
                <ImageIcon className="h-4 w-4" />
                Sur Samyam Gallery
              </p>
              <h1 className="font-display text-4xl font-bold text-[#1B4D3E] sm:text-5xl">
                Classroom moments, recital energy, and practice-room warmth
              </h1>
              <p className="max-w-2xl text-base text-[#4A5E52] sm:text-lg">
                A curated collection of musical moments, performances, and classroom memories.
              </p>
            </div>

            <Button variant="outline" className="w-fit border-[#C9922A] bg-white/80" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#1B4D3E]">Image Wall</h2>
              <p className="text-sm text-[#4A5E52]">
                {images.length} {images.length === 1 ? "image" : "images"} available
              </p>
            </div>
          </div>

          {isLoading ? (
            <Card className="border-dashed border-[#C9922A] bg-white/70">
              <CardContent className="flex flex-col items-center px-6 py-16 text-center">
                <p className="text-sm text-[#4A5E52]">Loading gallery...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-dashed border-[#C9922A] bg-white/70">
              <CardContent className="flex flex-col items-center px-6 py-16 text-center">
                <p className="text-sm text-[#4A5E52]">Unable to load gallery images.</p>
              </CardContent>
            </Card>
          ) : images.length === 0 ? (
            <Card className="border-dashed border-[#C9922A] bg-white/70">
              <CardContent className="flex flex-col items-center px-6 py-16 text-center">
                <UploadCloud className="mb-4 h-10 w-10 text-[#C9922A]" />
                <h3 className="font-display text-2xl font-semibold text-[#1B4D3E]">
                  No gallery images yet
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#4A5E52]">
                  Once the admin uploads images, they will appear here automatically.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {images.map((image) => (
                <Card
                  key={image.id}
                  variant="elevated"
                  className="group overflow-hidden border-[#E0C88B] bg-white"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#F5ECD7]">
                    <img
                      src={image.src}
                      alt={image.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="space-y-2 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-xl font-semibold text-[#1B4D3E]">
                        {image.title}
                      </h3>
                      <span className="rounded-full bg-[#F5ECD7] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#8B621D]">
                        New
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-[#4A5E52]">
                      {image.description || "A gallery image from Sur Samyam."}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
