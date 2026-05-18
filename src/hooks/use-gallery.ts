import { useEffect, useState } from "react";
import { galleryStore, type GalleryImage } from "@/lib/gallery";

export function useGallery() {
  const [images, setImages] = useState<GalleryImage[]>(() => galleryStore.list());

  useEffect(() => galleryStore.subscribe(() => setImages(galleryStore.list())), []);

  return images;
}
