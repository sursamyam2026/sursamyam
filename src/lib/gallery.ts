import { supabase } from "@/lib/supabase";

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

interface GalleryImageRow {
  id: string;
  title: string;
  src: string;
  description: string | null;
  created_at: string;
  source: "seed" | "upload";
}

const KEY = "swarshiksha:gallery";
const CACHE_KEY = "swarshiksha:gallery:cache";
const EVENT = "swarshiksha:gallery:changed";
const CACHE_TTL_MS = 1000 * 60 * 20;
let memoryCache: GalleryCache | null = null;

interface GalleryCache {
  savedAt: number;
  images: GalleryImage[];
}

function notifyGalleryChanged() {
  window.dispatchEvent(new Event(EVENT));
}

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

function fromRow(row: GalleryImageRow): GalleryImage {
  return {
    id: row.id,
    title: row.title,
    src: row.src,
    description: row.description ?? undefined,
    createdAt: row.created_at,
    source: row.source,
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
  notifyGalleryChanged();
}

function readCache(): GalleryCache | null {
  if (!supabase) return null;
  if (memoryCache) return memoryCache;

  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GalleryCache>;
    if (typeof parsed.savedAt !== "number" || !Array.isArray(parsed.images)) {
      return null;
    }

    const images = parsed.images.map(coerceImage).filter(Boolean) as GalleryImage[];
    if (images.length === 0) return null;
    memoryCache = { savedAt: parsed.savedAt, images };
    return memoryCache;
  } catch {
    return null;
  }
}

function writeCache(images: GalleryImage[]) {
  if (!supabase) return;

  memoryCache = {
    savedAt: Date.now(),
    images,
  };

  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify(memoryCache satisfies GalleryCache),
    );
  } catch {
    localStorage.removeItem(CACHE_KEY);
  }
}

function clearCache() {
  memoryCache = null;
  localStorage.removeItem(CACHE_KEY);
}

async function fetchImages(limit: number): Promise<GalleryImage[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("id,title,src,description,created_at,source")
      .order("created_at", { ascending: false })
      .range(0, Math.max(limit - 1, 0));
    if (error) throw error;

    const images = ((data ?? []) as GalleryImageRow[]).map(fromRow);
    writeCache(images);
    return images;
  }

  return readUploads().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ).slice(0, limit);
}

export const galleryStore = {
  getCached(limit = 60): GalleryImage[] {
    if (!supabase) {
      return readUploads().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ).slice(0, limit);
    }

    return readCache()?.images.slice(0, limit) ?? [];
  },

  hasFreshCache(limit = 60): boolean {
    const cache = readCache();
    return Boolean(
      cache &&
        Date.now() - cache.savedAt < CACHE_TTL_MS &&
        cache.images.length >= Math.min(limit, 1),
    );
  },

  async list(limit = 60, options: { preferCache?: boolean } = {}): Promise<GalleryImage[]> {
    if (options.preferCache) {
      const cache = this.getCached(limit);
      if (cache.length > 0 && this.hasFreshCache(limit)) {
        return cache;
      }
    }

    return fetchImages(limit);
  },

  async refresh(limit = 60): Promise<GalleryImage[]> {
    return fetchImages(limit);
  },

  async addMany(inputs: GalleryUploadInput[]): Promise<GalleryImage[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("gallery_images")
        .insert(
          inputs.map((input) => ({
            title: input.title.trim(),
            src: input.src,
            description: input.description?.trim() || null,
            source: "upload",
          })),
        )
        .select("id,title,src,description,created_at,source");
      if (error) throw error;
      clearCache();
      notifyGalleryChanged();
      return ((data ?? []) as GalleryImageRow[]).map(fromRow);
    }

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

  async remove(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from("gallery_images").delete().eq("id", id);
      if (error) throw error;
      clearCache();
      notifyGalleryChanged();
      return;
    }

    writeUploads(readUploads().filter((image) => image.id !== id));
  },

  subscribe(cb: () => void): () => void {
    const handler = () => {
      clearCache();
      cb();
    };
    window.addEventListener(EVENT, handler);

    if (supabase) {
      const channel = supabase
        .channel("public:gallery_images")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "gallery_images" },
          handler,
        )
        .subscribe();

      return () => {
        window.removeEventListener(EVENT, handler);
        void supabase.removeChannel(channel);
      };
    }

    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  },
};
