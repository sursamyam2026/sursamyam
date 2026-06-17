import { requireSupabase, supabase } from "@/lib/supabase";

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

interface EventRow {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  event_end_date: string | null;
  event_end_time: string | null;
  home_popup_start_date: string | null;
  venue: string | null;
  description: string | null;
  poster_src: string;
  is_published: boolean;
  created_at: string;
}

const EVENT = "sursamyam:events:changed";
let memoryCache: EventItem[] = [];

const EVENT_SELECT =
  "id,title,event_date,event_time,event_end_date,event_end_time,home_popup_start_date,venue,description,poster_src,is_published,created_at";

function notifyEventsChanged() {
  window.dispatchEvent(new Event(EVENT));
}

function throwSupabaseError(error: { message?: string } | null) {
  if (error) {
    throw new Error(error.message || "Supabase request failed.");
  }
}

function timeValue(value: string | null | undefined): string | undefined {
  return value ? value.slice(0, 5) : undefined;
}

function fromRow(row: EventRow): EventItem {
  return {
    id: row.id,
    title: row.title,
    eventDate: row.event_date,
    eventTime: timeValue(row.event_time),
    eventEndDate: row.event_end_date ?? undefined,
    eventEndTime: timeValue(row.event_end_time),
    homePopupStartDate: row.home_popup_start_date ?? undefined,
    venue: row.venue ?? undefined,
    description: row.description ?? undefined,
    posterSrc: row.poster_src,
    isPublished: row.is_published,
    createdAt: row.created_at,
  };
}

function toRow(input: EventUploadInput) {
  return {
    title: input.title.trim(),
    event_date: input.eventDate,
    event_time: input.eventTime || null,
    event_end_date: input.eventEndDate || input.eventDate,
    event_end_time: input.eventEndTime || input.eventTime || null,
    home_popup_start_date: input.homePopupStartDate || null,
    venue: input.venue?.trim() || null,
    description: input.description?.trim() || null,
    poster_src: input.posterSrc,
    is_published: input.isPublished,
  };
}

function sortEvents(events: EventItem[]): EventItem[] {
  return [...events].sort((a, b) => {
    const dateCompare = a.eventDate.localeCompare(b.eventDate);
    if (dateCompare !== 0) return dateCompare;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

async function fetchEvents(
  limit: number,
  options: { publishedOnly?: boolean } = {},
): Promise<EventItem[]> {
  const db = requireSupabase();
  let query = db.from("events").select(EVENT_SELECT);

  if (options.publishedOnly) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query
    .order("event_date", { ascending: true })
    .order("created_at", { ascending: false })
    .range(0, Math.max(limit - 1, 0));
  throwSupabaseError(error);

  const events = ((data ?? []) as EventRow[]).map(fromRow);
  memoryCache = sortEvents(events);
  return memoryCache;
}

export const eventsStore = {
  getCached(limit = 60): EventItem[] {
    return memoryCache.slice(0, limit);
  },

  hasFreshCache(): boolean {
    return memoryCache.length > 0;
  },

  async getById(id: string): Promise<EventItem | null> {
    const cached = memoryCache.find((event) => event.id === id);
    if (cached) return cached;

    const db = requireSupabase();
    const { data, error } = await db
      .from("events")
      .select(EVENT_SELECT)
      .eq("id", id)
      .maybeSingle();
    throwSupabaseError(error);

    return data ? fromRow(data as EventRow) : null;
  },

  async list(
    limit = 60,
    options: { publishedOnly?: boolean } = {},
  ): Promise<EventItem[]> {
    return fetchEvents(limit, options);
  },

  async refresh(
    limit = 60,
    options: { publishedOnly?: boolean } = {},
  ): Promise<EventItem[]> {
    return fetchEvents(limit, options);
  },

  async add(input: EventUploadInput): Promise<EventItem> {
    const db = requireSupabase();
    const { data, error } = await db
      .from("events")
      .insert(toRow(input))
      .select(EVENT_SELECT)
      .single();
    throwSupabaseError(error);

    const event = fromRow(data as EventRow);
    memoryCache = sortEvents([event, ...memoryCache]);
    notifyEventsChanged();
    return event;
  },

  async update(id: string, input: EventUploadInput): Promise<EventItem> {
    const db = requireSupabase();
    const { data, error } = await db
      .from("events")
      .update(toRow(input))
      .eq("id", id)
      .select(EVENT_SELECT)
      .single();
    throwSupabaseError(error);

    const event = fromRow(data as EventRow);
    memoryCache = sortEvents(
      memoryCache.map((cachedEvent) => (cachedEvent.id === id ? event : cachedEvent)),
    );
    notifyEventsChanged();
    return event;
  },

  async remove(id: string): Promise<void> {
    const db = requireSupabase();
    const { error } = await db.from("events").delete().eq("id", id);
    throwSupabaseError(error);

    memoryCache = memoryCache.filter((event) => event.id !== id);
    notifyEventsChanged();
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(EVENT, handler);

    if (!supabase) return () => window.removeEventListener(EVENT, handler);

    const channel = supabase
      .channel("public:events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        handler,
      )
      .subscribe();

    return () => {
      window.removeEventListener(EVENT, handler);
      void supabase.removeChannel(channel);
    };
  },
};
