import { useEffect, useState } from "react";
import { galleryStore, type GalleryImage } from "@/lib/gallery";

export function useGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    try {
      setError(null);
      setImages(await galleryStore.list());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unable to load gallery."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    return galleryStore.subscribe(() => {
      void refresh();
    });
  }, []);

  return { images, isLoading, error, refresh };
}
