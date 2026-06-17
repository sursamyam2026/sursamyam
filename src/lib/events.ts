export interface EventItem {
  id: string;
  title: string;
  eventDate: string;
  eventTime?: string;
  eventEndDate?: string;
  eventEndTime?: string;
  homePopupStartDate?: string;
  venue?: string;
  description?: string;
  posterSrc: string;
  isPublished: boolean;
  createdAt: string;
}

export interface EventUploadInput {
  title: string;
  eventDate: string;
  eventTime?: string;
  eventEndDate?: string;
  eventEndTime?: string;
  homePopupStartDate?: string;
  venue?: string;
  description?: string;
  posterSrc: string;
  isPublished: boolean;
}

const STORAGE_KEY = "sursamyam:events:local";
const EVENT = "sursamyam:events:changed";

function notifyEventsChanged() {
  window.dispatchEvent(new Event(EVENT));
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `event-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function coerceEvent(raw: unknown): EventItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id : "";
  const title = typeof item.title === "string" ? item.title : "";
  const eventDate = typeof item.eventDate === "string" ? item.eventDate : "";
  const posterSrc = typeof item.posterSrc === "string" ? item.posterSrc : "";

  if (!id || !title || !eventDate || !posterSrc) return null;

  return {
    id,
    title,
    eventDate,
    eventTime: typeof item.eventTime === "string"
      ? item.eventTime
      : typeof item.event_time === "string"
        ? item.event_time.slice(0, 5)
        : undefined,
    eventEndDate:
      typeof item.eventEndDate === "string"
        ? item.eventEndDate
        : typeof item.event_end_date === "string"
          ? item.event_end_date
          : typeof item.homePopupEndDate === "string"
            ? item.homePopupEndDate
            : typeof item.home_popup_end_date === "string"
              ? item.home_popup_end_date
              : eventDate,
    eventEndTime:
      typeof item.eventEndTime === "string"
        ? item.eventEndTime
        : typeof item.event_end_time === "string"
          ? item.event_end_time.slice(0, 5)
          : typeof item.eventTime === "string"
            ? item.eventTime
            : typeof item.event_time === "string"
              ? item.event_time.slice(0, 5)
              : undefined,
    homePopupStartDate:
      typeof item.homePopupStartDate === "string"
        ? item.homePopupStartDate
        : typeof item.home_popup_start_date === "string"
          ? item.home_popup_start_date
          : undefined,
    venue: typeof item.venue === "string" ? item.venue : undefined,
    description: typeof item.description === "string" ? item.description : undefined,
    posterSrc,
    isPublished: item.isPublished !== false,
    createdAt:
      typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
  };
}

function sortEvents(events: EventItem[]): EventItem[] {
  return [...events].sort((a, b) => {
    const dateCompare = a.eventDate.localeCompare(b.eventDate);
    if (dateCompare !== 0) return dateCompare;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

function readEvents(): EventItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return sortEvents(parsed.map(coerceEvent).filter(Boolean) as EventItem[]);
  } catch {
    return [];
  }
}

function writeEvents(events: EventItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortEvents(events)));
  } catch {
    throw new Error("Unable to save event locally. The selected image may be too large for browser storage.");
  }
}

export const eventsStore = {
  getCached(limit = 60): EventItem[] {
    return readEvents().slice(0, limit);
  },

  getById(id: string): EventItem | null {
    return readEvents().find((event) => event.id === id) ?? null;
  },

  hasFreshCache(): boolean {
    return true;
  },

  async list(
    limit = 60,
    options: { publishedOnly?: boolean } = {},
  ): Promise<EventItem[]> {
    const events = readEvents();
    return (options.publishedOnly
      ? events.filter((event) => event.isPublished)
      : events
    ).slice(0, limit);
  },

  async refresh(
    limit = 60,
    options: { publishedOnly?: boolean } = {},
  ): Promise<EventItem[]> {
    return this.list(limit, options);
  },

  async add(input: EventUploadInput): Promise<EventItem> {
    const nextEvent: EventItem = {
      id: createId(),
      title: input.title.trim(),
      eventDate: input.eventDate,
      eventTime: input.eventTime || undefined,
      eventEndDate: input.eventEndDate || input.eventDate,
      eventEndTime: input.eventEndTime || input.eventTime || undefined,
      homePopupStartDate: input.homePopupStartDate || undefined,
      venue: input.venue?.trim() || undefined,
      description: input.description?.trim() || undefined,
      posterSrc: input.posterSrc,
      isPublished: input.isPublished,
      createdAt: new Date().toISOString(),
    };

    writeEvents([nextEvent, ...readEvents()]);
    notifyEventsChanged();
    return nextEvent;
  },

  async update(id: string, input: EventUploadInput): Promise<EventItem> {
    const events = readEvents();
    const existing = events.find((event) => event.id === id);
    if (!existing) throw new Error("Event not found.");

    const nextEvent: EventItem = {
      ...existing,
      title: input.title.trim(),
      eventDate: input.eventDate,
      eventTime: input.eventTime || undefined,
      eventEndDate: input.eventEndDate || input.eventDate,
      eventEndTime: input.eventEndTime || input.eventTime || undefined,
      homePopupStartDate: input.homePopupStartDate || undefined,
      venue: input.venue?.trim() || undefined,
      description: input.description?.trim() || undefined,
      posterSrc: input.posterSrc,
      isPublished: input.isPublished,
    };

    writeEvents(events.map((event) => (event.id === id ? nextEvent : event)));
    notifyEventsChanged();
    return nextEvent;
  },

  async remove(id: string): Promise<void> {
    writeEvents(readEvents().filter((event) => event.id !== id));
    notifyEventsChanged();
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    const storageHandler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) cb();
    };

    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", storageHandler);
    };
  },
};
