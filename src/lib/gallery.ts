export interface GalleryImage {
  id: string;
  title: string;
  src: string;
  description?: string;
  createdAt: string;
  source: "seed" | "upload";
}

export interface GalleryUploadInput {
  title: string;
  src: string;
  description?: string;
}

const KEY = "swarshiksha:gallery";
const EVENT = "swarshiksha:gallery:changed";

function coerceImage(raw: unknown): GalleryImage | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id : "";
  const title = typeof item.title === "string" ? item.title : "";
  const src = typeof item.src === "string" ? item.src : "";

  if (!id || !title || !src) return null;

  return {
    id,
    title,
    src,
    description: typeof item.description === "string" ? item.description : undefined,
    createdAt:
      typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    source: item.source === "seed" ? "seed" : "upload",
  };
}

function readUploads(): GalleryImage[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(coerceImage).filter(Boolean) as GalleryImage[];
  } catch {
    return [];
  }
}

function writeUploads(images: GalleryImage[]) {
  localStorage.setItem(KEY, JSON.stringify(images));
  window.dispatchEvent(new Event(EVENT));
}

export const galleryStore = {
  list(): GalleryImage[] {
    return readUploads().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  addMany(inputs: GalleryUploadInput[]): GalleryImage[] {
    const uploads = inputs.map((input) => ({
      id: crypto.randomUUID(),
      title: input.title.trim(),
      src: input.src,
      description: input.description?.trim() || undefined,
      createdAt: new Date().toISOString(),
      source: "upload" as const,
    }));
    writeUploads([...uploads, ...readUploads()]);
    return uploads;
  },

  remove(id: string) {
    writeUploads(readUploads().filter((image) => image.id !== id));
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  },
};
