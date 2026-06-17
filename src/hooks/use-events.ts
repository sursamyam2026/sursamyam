import { useCallback, useEffect, useState } from "react";
import { eventsStore, type EventItem } from "@/lib/events";

export function useEvents(limit = 60, options: { publishedOnly?: boolean } = {}) {
  const [events, setEvents] = useState<EventItem[]>(() => {
    const cached = eventsStore.getCached(limit);
    return options.publishedOnly ? cached.filter((event) => event.isPublished) : cached;
  });
  const [isLoading, setIsLoading] = useState(() => eventsStore.getCached(limit).length === 0);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async (force = false) => {
    try {
      setError(null);
      const nextEvents = force
        ? await eventsStore.refresh(limit, { publishedOnly: options.publishedOnly })
        : await eventsStore.list(limit, {
            preferCache: true,
            publishedOnly: options.publishedOnly,
          });
      setEvents(nextEvents);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unable to load events."));
    } finally {
      setIsLoading(false);
    }
  }, [limit, options.publishedOnly]);

  useEffect(() => {
    const cached = eventsStore.getCached(limit);
    setEvents(options.publishedOnly ? cached.filter((event) => event.isPublished) : cached);
    if (!eventsStore.hasFreshCache(limit)) {
      void refresh(true);
    } else {
      setIsLoading(false);
      void refresh();
    }

    return eventsStore.subscribe(() => {
      setIsLoading(true);
      void refresh(true);
    });
  }, [limit, options.publishedOnly, refresh]);

  return { events, isLoading, error, refresh };
}
