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
const EVENT = "swarshiksha:gallery:changed";

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

export const galleryStore = {
  async list(limit = 60): Promise<GalleryImage[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id,title,src,description,created_at,source")
        .order("created_at", { ascending: false })
        .range(0, Math.max(limit - 1, 0));
      if (error) throw error;
      return ((data ?? []) as GalleryImageRow[]).map(fromRow);
    }

    return readUploads().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ).slice(0, limit);
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
      notifyGalleryChanged();
      return;
    }

    writeUploads(readUploads().filter((image) => image.id !== id));
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();
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
