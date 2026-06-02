import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useGallery } from "@/hooks/use-gallery";
import { galleryStore } from "@/lib/gallery";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";

function titleFromFilename(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Could not read the selected file."));
    };
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

const GalleryManager = () => {
  const { images, isLoading, error, refresh } = useGallery();
  const uploadCount = useMemo(
    () => images.filter((image) => image.source === "upload").length,
    [images],
  );
  const { toast } = useToast();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    setSelectedFiles(files);
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (selectedFiles.length === 0) {
      toast({
        title: "Select at least one image",
        description: "Choose image files before uploading to the gallery.",
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploads = await Promise.all(
        selectedFiles.map(async (file) => ({
          title: titleFromFilename(file.name),
          src: await readFileAsDataUrl(file),
          description: description.trim() || undefined,
        })),
      );

      await galleryStore.addMany(uploads);
      await refresh();
      setSelectedFiles([]);
      setDescription("");

      toast({
        title: "Gallery updated",
        description: `${uploads.length} ${uploads.length === 1 ? "image" : "images"} uploaded successfully.`,
        className: "border-[#C9922A] bg-[#1B4D3E] text-[#FDF6EC]",
      });
    } catch {
      toast({
        title: "Upload failed",
        description: "Please try again with valid image files.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await galleryStore.remove(id);
      await refresh();
      toast({
        title: "Image removed",
        description: "The selected upload was removed from the gallery.",
      });
    } catch (err) {
      toast({
        title: "Unable to remove image",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold lg:text-3xl">Gallery Manager</h1>
        <p className="mt-1 text-muted-foreground">
          {error
            ? "Unable to load gallery images."
            : "Upload new gallery images for the public page."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card variant="elevated" className="p-6">
          <p className="text-sm text-muted-foreground">Visible Images</p>
          <p className="mt-2 font-display text-4xl font-bold">{images.length}</p>
        </Card>
        <Card variant="elevated" className="p-6">
          <p className="text-sm text-muted-foreground">Admin Uploads</p>
          <p className="mt-2 font-display text-4xl font-bold">{uploadCount}</p>
        </Card>
        <Card variant="elevated" className="p-6">
          <p className="text-sm text-muted-foreground">Ready to Publish</p>
          <p className="mt-2 font-display text-4xl font-bold">
            {selectedFiles.length}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>
            You can upload multiple image files at once. Titles are generated from filenames.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="gallery-images">Select images</Label>
              <Input
                id="gallery-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                {selectedFiles.length === 0
                  ? "No images selected yet."
                  : `${selectedFiles.length} image${selectedFiles.length === 1 ? "" : "s"} ready to upload.`}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gallery-description">Shared description</Label>
              <Input
                id="gallery-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional description shown under each selected image"
              />
            </div>

            <Button type="submit" variant="hero" className="text-[#1B1100]" disabled={isUploading}>
              <UploadCloud className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload to Gallery"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <Card className="p-6 text-sm text-muted-foreground">Loading gallery...</Card>
        ) : images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden bg-[#F5ECD7]">
              <img src={image.src} alt={image.title} className="h-full w-full object-cover" />
            </div>
            <CardContent className="space-y-4 p-5">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold text-[#1B4D3E]">
                    {image.title}
                  </h2>
                  <span className="rounded-full bg-[#F5ECD7] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#8B621D]">
                    Uploaded
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {image.description || "No description added."}
                </p>
              </div>

              <Button variant="outline" size="sm" onClick={() => handleDelete(image.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GalleryManager;
