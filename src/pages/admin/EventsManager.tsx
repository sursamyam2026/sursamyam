import { useState, type ChangeEvent, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventDatePicker from "@/components/EventDatePicker";
import EventDateTimePicker from "@/components/EventDateTimePicker";
import { useToast } from "@/hooks/use-toast";
import { useEvents } from "@/hooks/use-events";
import { eventsStore } from "@/lib/events";
import type { EventItem } from "@/lib/events";
import {
  CalendarDays,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  ImagePlus,
  MapPin,
  Megaphone,
  Send,
  Trash2,
  UploadCloud,
} from "lucide-react";

const PAGE_SIZE = 24;

function todayKey(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function compressImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const maxSize = 1800;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Could not prepare the selected image."));
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.84));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read the selected image."));
    };

    image.src = objectUrl;
  });
}

function formatEventDate(value: string, time?: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  if (!time) return formattedDate;

  const formattedTime = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(`${value}T${time}:00`));

  return `${formattedDate}, ${formattedTime}`;
}

function formatEventRange(
  startDate: string,
  startTime?: string,
  endDate?: string,
  endTime?: string,
): string {
  const start = formatEventDate(startDate, startTime);
  if (!endDate) return start;

  return `${start} - ${formatEventDate(endDate, endTime)}`;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Please try again.";
}

const EventsManager = () => {
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);
  const { events, isLoading, error, refresh } = useEvents(visibleLimit);
  const canLoadMore = events.length >= visibleLimit;
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("18:00");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventEndTime, setEventEndTime] = useState("20:00");
  const [homePopupStartDate, setHomePopupStartDate] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const today = todayKey();
  const publishedCount = events.filter((event) => event.isPublished).length;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = Array.from(event.target.files ?? []).find((item) =>
      item.type.startsWith("image/"),
    );
    setPosterFile(file ?? null);
  };

  const resetForm = () => {
    setTitle("");
    setEventDate("");
    setEventTime("18:00");
    setEventEndDate("");
    setEventEndTime("20:00");
    setHomePopupStartDate("");
    setVenue("");
    setDescription("");
    setPosterFile(null);
    setIsPublished(true);
    setEditingEvent(null);
  };

  const handleEdit = (event: EventItem) => {
    setEditingEvent(event);
    setTitle(event.title);
    setEventDate(event.eventDate);
    setEventTime(event.eventTime || "18:00");
    setEventEndDate(event.eventEndDate || event.eventDate);
    setEventEndTime(event.eventEndTime || event.eventTime || "20:00");
    setHomePopupStartDate(event.homePopupStartDate || "");
    setVenue(event.venue || "");
    setDescription(event.description || "");
    setPosterFile(null);
    setIsPublished(event.isPublished);
    setActiveTab("create");
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !eventDate || !eventEndDate || (!posterFile && !editingEvent)) {
      toast({
        title: "Add required event details",
        description: "Title, start/end date-time, and poster/banner image are required.",
      });
      return;
    }

    const startDateTime = `${eventDate}T${eventTime}:00`;
    const endDateTime = `${eventEndDate}T${eventEndTime}:00`;

    if (endDateTime <= startDateTime) {
      toast({
        title: "Check event timing",
        description: "Event end date and time must be after the start date and time.",
      });
      return;
    }

    if (
      (homePopupStartDate && homePopupStartDate < today) ||
      (homePopupStartDate && homePopupStartDate > eventEndDate)
    ) {
      toast({
        title: "Check home popup dates",
        description: "Popup start date cannot be before today or after the event ends.",
      });
      return;
    }

    setIsUploading(true);
    try {
      const posterSrc = posterFile
        ? await compressImageAsDataUrl(posterFile)
        : editingEvent?.posterSrc;

      if (!posterSrc) {
        throw new Error("Poster or banner image is required.");
      }

      const payload = {
        title,
        eventDate,
        eventTime,
        eventEndDate,
        eventEndTime,
        homePopupStartDate,
        venue,
        description,
        posterSrc,
        isPublished,
      };

      if (editingEvent) {
        await eventsStore.update(editingEvent.id, payload);
      } else {
        await eventsStore.add(payload);
      }

      await refresh(true);
      resetForm();
      setActiveTab("manage");

      toast({
        title: editingEvent ? "Event updated" : "Event published",
        description: editingEvent
          ? "The event details were updated successfully."
          : "The event details and poster were saved successfully.",
        className: "border-[#C9922A] bg-[#1B4D3E] text-[#FDF6EC]",
      });
    } catch (err) {
      toast({
        title: "Unable to save event",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eventsStore.remove(id);
      await refresh(true);
      toast({
        title: "Event removed",
        description: "The selected event was removed from the public events page.",
      });
    } catch (err) {
      toast({
        title: "Unable to remove event",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold lg:text-3xl">Events Manager</h1>
        <p className="mt-1 text-muted-foreground">
          {error
            ? "Unable to load events."
            : "Upload event details and a poster or banner for the public events page."}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-auto w-full justify-start rounded-xl border border-[#E8D5A3] bg-[#FDF6EC] p-1 sm:w-fit">
          <TabsTrigger
            value="create"
            className="rounded-lg px-5 py-2.5 data-[state=active]:bg-[#1B4D3E] data-[state=active]:text-[#FDF6EC]"
          >
            {editingEvent ? "Edit Event" : "Create Event"}
          </TabsTrigger>
          <TabsTrigger
            value="manage"
            className="rounded-lg px-5 py-2.5 data-[state=active]:bg-[#1B4D3E] data-[state=active]:text-[#FDF6EC]"
          >
            Manage Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-0">
          <Card>
        <CardHeader>
          <CardTitle>{editingEvent ? "Edit Event" : "Create Event"}</CardTitle>
          <CardDescription>
            {editingEvent
              ? "Update the event details, schedule, poster, and publishing state."
              : "Add the event details and choose a poster or wide banner image."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
              <div className="space-y-6">
                <section className="space-y-4 rounded-xl border border-[#E8D5A3] bg-[#FDF6EC]/60 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B4D3E] text-[#FDF6EC]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-[#1B4D3E]">
                        Event Details
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Name, venue, and the public description.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="event-title">Event title</Label>
                      <Input
                        id="event-title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Annual Music Recital"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-venue">Venue</Label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9922A]" />
                        <Input
                          id="event-venue"
                          value={venue}
                          onChange={(event) => setVenue(event.target.value)}
                          placeholder="Online / School auditorium / Bengaluru"
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Short event details, timings, entry notes, or audience instructions"
                      className="min-h-32"
                    />
                  </div>
                </section>

                <section className="space-y-4 rounded-xl border border-[#E8D5A3] bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B4D3E] text-[#FDF6EC]">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-[#1B4D3E]">
                        Event Schedule
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        The popup will hide automatically after the event ends.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Starts</Label>
                      <EventDateTimePicker
                        date={eventDate}
                        time={eventTime}
                        onDateChange={setEventDate}
                        onTimeChange={setEventTime}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Ends</Label>
                      <EventDateTimePicker
                        date={eventEndDate}
                        time={eventEndTime}
                        onDateChange={setEventEndDate}
                        onTimeChange={setEventEndTime}
                      />
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="space-y-4 rounded-xl border border-[#E8D5A3] bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B4D3E] text-[#FDF6EC]">
                      <Megaphone className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-[#1B4D3E]">
                        Home Popup
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Optional hero announcement timing.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="home-popup-start-date">Show from</Label>
                    <EventDatePicker
                      value={homePopupStartDate}
                      onChange={setHomePopupStartDate}
                      placeholder="Select start date"
                      minDate={today}
                      maxDate={eventEndDate || undefined}
                    />
                    <p className="text-sm text-muted-foreground">
                      Starts no earlier than today and stays visible until the event ends.
                    </p>
                  </div>
                </section>

                <section className="space-y-4 rounded-xl border border-[#E8D5A3] bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B4D3E] text-[#FDF6EC]">
                      <ImagePlus className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-[#1B4D3E]">
                        Poster
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Upload the event poster or banner.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-poster">Poster or banner</Label>
                    <Input
                      id="event-poster"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                      required={!editingEvent}
                    />
                    <p className="break-words text-sm text-muted-foreground">
                      {posterFile
                        ? posterFile.name
                        : editingEvent
                          ? "Current poster will be kept unless you choose a new image."
                          : "No image selected yet."}
                    </p>
                  </div>
                </section>

                <section className="space-y-4 rounded-xl border border-[#E8D5A3] bg-[#FDF6EC]/60 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B4D3E] text-[#FDF6EC]">
                        <Send className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-[#1B4D3E]">
                          Publish
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Control public visibility.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="event-published"
                      checked={isPublished}
                      onCheckedChange={setIsPublished}
                      className="data-[state=checked]:bg-[#1B4D3E] data-[state=unchecked]:bg-[#D8C08B] [&>span]:bg-[#FDF6EC]"
                    />
                  </div>

                  <Label htmlFor="event-published" className="block cursor-pointer text-sm text-[#4A5E52]">
                    {isPublished
                      ? "This event will appear on the Events page."
                      : "Save as a draft for now."}
                  </Label>

                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full text-[#1B1100]"
                    disabled={isUploading}
                  >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    {isUploading
                      ? "Saving..."
                      : editingEvent
                        ? "Update Event"
                        : "Save Event"}
                  </Button>
                  {editingEvent ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleCancelEdit}
                      disabled={isUploading}
                    >
                      Cancel Edit
                    </Button>
                  ) : null}
                </section>
              </div>
            </div>
          </form>
        </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="mt-0 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card variant="elevated" className="p-6">
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="mt-2 font-display text-4xl font-bold">{events.length}</p>
            </Card>
            <Card variant="elevated" className="p-6">
              <p className="text-sm text-muted-foreground">Published</p>
              <p className="mt-2 font-display text-4xl font-bold">{publishedCount}</p>
            </Card>
            <Card variant="elevated" className="p-6">
              <p className="text-sm text-muted-foreground">Selected Poster</p>
              <p className="mt-2 font-display text-4xl font-bold">{posterFile ? "1" : "0"}</p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <Card className="p-6 text-sm text-muted-foreground">Loading events...</Card>
        ) : events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <div className="aspect-[16/9] overflow-hidden bg-[#F5ECD7]">
              <img
                src={event.posterSrc}
                alt={`${event.title} poster`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="space-y-4 p-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#8B621D]">
                  <CalendarDays className="h-4 w-4" />
                  {formatEventRange(
                    event.eventDate,
                    event.eventTime,
                    event.eventEndDate,
                    event.eventEndTime,
                  )}
                </div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 break-words font-display text-xl font-semibold text-[#1B4D3E]">
                    {event.title}
                  </h2>
                  <span className="inline-flex shrink-0 items-center rounded-full bg-[#F5ECD7] px-3 py-1 text-xs font-medium text-[#8B621D]">
                    {event.isPublished ? (
                      <Eye className="mr-1 h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="mr-1 h-3.5 w-3.5" />
                    )}
                    {event.isPublished ? "Live" : "Draft"}
                  </span>
                </div>
                {event.description ? (
                  <p className="break-words text-sm text-muted-foreground">
                    {event.description}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
          </div>

          {canLoadMore ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVisibleLimit((limit) => limit + PAGE_SIZE)}
                disabled={isLoading}
              >
                Load more events
              </Button>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventsManager;
