import { useCallback, useEffect, useState } from "react";
import { galleryStore, type GalleryImage } from "@/lib/gallery";

export function useGallery(limit = 60) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setImages(await galleryStore.list(limit));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unable to load gallery."));
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void refresh();
    return galleryStore.subscribe(() => {
      void refresh();
    });
  }, [refresh]);

  return { images, isLoading, error, refresh };
}
