import { useCallback, useEffect, useState } from "react";
import { galleryStore, type GalleryImage } from "@/lib/gallery";

export function useGallery(limit = 60) {
  const [images, setImages] = useState<GalleryImage[]>(() => galleryStore.getCached(limit));
  const [isLoading, setIsLoading] = useState(() => galleryStore.getCached(limit).length === 0);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async (force = false) => {
    try {
      setError(null);
      const nextImages = force
        ? await galleryStore.refresh(limit)
        : await galleryStore.list(limit, { preferCache: true });
      setImages(nextImages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unable to load gallery."));
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    setImages(galleryStore.getCached(limit));
    if (!galleryStore.hasFreshCache(limit)) {
      void refresh(true);
    } else {
      setIsLoading(false);
      void refresh();
    }

    return galleryStore.subscribe(() => {
      setIsLoading(true);
      void refresh(true);
    });
  }, [limit, refresh]);

  return { images, isLoading, error, refresh };
}
