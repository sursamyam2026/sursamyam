import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronUp, MapPin, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/use-events";
import type { EventItem } from "@/lib/events";

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const STORAGE_PREFIX = "sursamyam:event-popup:minimized:";

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayKey(date = new Date()): string {
  return toDateKey(date);
}

function dateAtStartOfDay(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function dateAtEventTime(event: EventItem): Date {
  return new Date(`${event.eventDate}T${event.eventTime || "00:00"}:00`);
}

function dateAtEventEndTime(event: EventItem): Date {
  return new Date(`${event.eventEndDate || event.eventDate}T${event.eventEndTime || event.eventTime || "23:59"}:00`);
}

function localDateKeyFromIso(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return toDateKey(date);
}

function isEventActiveForHome(event: EventItem, now = new Date()): boolean {
  if (!event.isPublished) return false;

  const today = todayKey(now);
  const popupStartDate = event.homePopupStartDate || localDateKeyFromIso(event.createdAt);

  return today >= popupStartDate && now < dateAtEventEndTime(event);
}

function isHappeningNow(event: EventItem, now = new Date()): boolean {
  const time = now.getTime();
  return time >= dateAtEventTime(event).getTime() && time < dateAtEventEndTime(event).getTime();
}

function formatEventDate(value: string, time?: string): string {
  const date = dateAtStartOfDay(value);
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

function getCountdown(event: EventItem): CountdownParts {
  const diff = Math.max(0, dateAtEventTime(event).getTime() - Date.now());

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

function Countdown({ event, now }: { event: EventItem; now: Date }) {
  const [parts, setParts] = useState(() => getCountdown(event));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setParts(getCountdown(event));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [event]);

  if (isHappeningNow(event, now)) {
    return (
      <div className="rounded-lg border border-[#b8860b]/30 bg-[#FDF6EC] px-3 py-2 text-center text-sm font-semibold text-[#1a3a2a]">
        Happening now
      </div>
    );
  }

  const items = [
    { label: "Days", value: parts.days },
    { label: "Hrs", value: parts.hours },
    { label: "Min", value: parts.minutes },
    { label: "Sec", value: parts.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-[#E8D5A3] bg-[#FDF6EC] px-2 py-2 text-center"
        >
          <div className="font-display text-lg font-bold leading-none text-[#1a3a2a]">
            {String(item.value).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#8B621D]">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

const EventHeroPopup = () => {
  const { events } = useEvents(60, { publishedOnly: true });
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const activeEvent = useMemo(() => {
    return events
      .filter((event) => isEventActiveForHome(event, now))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  }, [events, now]);

  const storageKey = activeEvent ? `${STORAGE_PREFIX}${activeEvent.id}` : "";
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!storageKey) return;
    setIsMinimized(sessionStorage.getItem(storageKey) === "true");
  }, [storageKey]);

  if (!activeEvent) return null;

  const handleMinimize = () => {
    sessionStorage.setItem(storageKey, "true");
    setIsMinimized(true);
  };

  const handleRestore = () => {
    sessionStorage.removeItem(storageKey);
    setIsMinimized(false);
  };

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={handleRestore}
        className="absolute bottom-5 right-4 z-20 flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-full border border-[#b8860b]/70 bg-[#1a3a2a] px-4 py-3 text-left text-sm font-semibold text-[#FDF6EC] shadow-[0_16px_40px_rgba(26,58,42,0.24)] transition hover:-translate-y-0.5 hover:bg-[#214934] sm:bottom-8 sm:right-8 sm:max-w-[300px]"
      >
        <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-[#b8860b]" />
        <span className="min-w-0 truncate">{activeEvent.title}</span>
        <ChevronUp className="h-4 w-4 shrink-0 text-[#b8860b]" />
      </button>
    );
  }

  return (
    <aside className="absolute bottom-5 left-4 right-4 z-20 overflow-hidden rounded-2xl border border-[#E8D5A3] bg-[#FDF6EC] text-left shadow-[0_18px_60px_rgba(26,58,42,0.22)] sm:bottom-auto sm:left-auto sm:right-8 sm:top-28 sm:w-[300px]">
      <div className="flex items-center justify-between gap-3 bg-[#1a3a2a] px-4 py-3 text-[#FDF6EC]">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-[#b8860b]" />
          <span className="rounded-full border border-[#b8860b]/50 bg-[#b8860b]/15 px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#F6D58A]">
            {isHappeningNow(activeEvent, now) ? "Live now" : "Upcoming"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleMinimize}
          aria-label="Minimise event popup"
          className="rounded-full p-1 text-[#F6D58A] transition hover:bg-white/10"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <h2 className="break-words font-display text-xl font-bold leading-tight text-[#1a3a2a]">
            {activeEvent.title}
          </h2>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-[#4A5E52]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-[#b8860b]" />
              {formatEventDate(activeEvent.eventDate, activeEvent.eventTime)}
            </span>
            {activeEvent.venue ? (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#b8860b]" />
                <span className="truncate">{activeEvent.venue}</span>
              </span>
            ) : null}
          </div>
        </div>

        <Countdown event={activeEvent} now={now} />

        <Button variant="hero" className="w-full text-[#1B1100]" asChild>
          <Link to={`/events/${activeEvent.id}`}>View details &rarr;</Link>
        </Button>
      </div>
    </aside>
  );
};

export default EventHeroPopup;
