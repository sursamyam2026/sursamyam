import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvents } from "@/hooks/use-events";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  History,
  MapPin,
  UploadCloud,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { EventItem } from "@/lib/events";

const PAGE_SIZE = 12;

function formatDateTime(value: string, time?: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  if (!time) return formattedDate;

  const formattedTime = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(`${value}T${time}:00`));

  return `${formattedDate} at ${formattedTime}`;
}

function formatEventRange(
  startDate: string,
  startTime?: string,
  endDate?: string,
  endTime?: string,
): string {
  const start = formatDateTime(startDate, startTime);
  if (!endDate) return start;

  const end = formatDateTime(endDate, endTime);
  return `${start} - ${end}`;
}

function dateAtEventStart(event: EventItem): Date {
  return new Date(`${event.eventDate}T${event.eventTime || "00:00"}:00`);
}

function dateAtEventEnd(event: EventItem): Date {
  return new Date(`${event.eventEndDate || event.eventDate}T${event.eventEndTime || event.eventTime || "23:59"}:00`);
}

function getEventStatus(event: EventItem, now = new Date()): "live" | "upcoming" | "past" {
  if (now >= dateAtEventEnd(event)) return "past";
  if (now >= dateAtEventStart(event)) return "live";
  return "upcoming";
}

const Events = () => {
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);
  const { events, isLoading, error } = useEvents(visibleLimit, { publishedOnly: true });
  const canLoadMore = events.length >= visibleLimit;
  const groupedEvents = useMemo(() => {
    const now = new Date();
    const upcoming = events
      .filter((event) => getEventStatus(event, now) !== "past")
      .sort((a, b) => dateAtEventStart(a).getTime() - dateAtEventStart(b).getTime());
    const past = events
      .filter((event) => getEventStatus(event, now) === "past")
      .sort((a, b) => dateAtEventEnd(b).getTime() - dateAtEventEnd(a).getTime());

    return { upcoming, past };
  }, [events]);

  const renderEventCards = (items: EventItem[], emptyLabel: string, emptyDescription: string) => {
    if (items.length === 0) {
      return (
        <Card className="border-dashed border-[#C9922A] bg-white/70">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <CalendarDays className="mb-4 h-10 w-10 text-[#C9922A]" />
            <h3 className="font-display text-2xl font-semibold text-[#1B4D3E]">
              {emptyLabel}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#4A5E52]">
              {emptyDescription}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {items.map((event) => {
          const status = getEventStatus(event);
          const statusLabel =
            status === "live" ? "Live now" : status === "past" ? "Past event" : "Upcoming";
          const statusClass =
            status === "live"
              ? "bg-[#1B4D3E] text-[#FDF6EC]"
              : status === "past"
                ? "bg-[#EFE7D5] text-[#4A5E52]"
                : "bg-[#F5ECD7] text-[#8B621D]";

          return (
            <Card
              key={event.id}
              variant="elevated"
              className="group overflow-hidden border-[#E0C88B] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Link to={`/events/${event.id}`} className="block h-full">
                <div className="relative aspect-[16/9] overflow-hidden bg-[#F5ECD7]">
                  <img
                    src={event.posterSrc}
                    alt={`${event.title} poster`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>
                <CardContent className="space-y-4 p-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-[#8B621D]">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {formatEventRange(
                          event.eventDate,
                          event.eventTime,
                          event.eventEndDate,
                          event.eventEndTime,
                        )}
                      </span>
                      {event.venue ? (
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.venue}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="break-words font-display text-2xl font-semibold text-[#1B4D3E]">
                      {event.title}
                    </h3>
                  </div>
                  {event.description ? (
                    <p className="break-words text-sm leading-6 text-[#4A5E52]">
                      {event.description}
                    </p>
                  ) : null}
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B4D3E]">
                    View details
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <Navbar />
      <main className="px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-5 rounded-[28px] border border-[#E8D5A3] bg-[linear-gradient(135deg,#F6E8C8_0%,#FDF6EC_55%,#EAF3EF_100%)] p-8 shadow-sm lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#C9922A]/40 bg-white/70 px-4 py-1 text-sm font-medium text-[#5C3A00]">
                <CalendarDays className="h-4 w-4" />
                Sur Samyam Events
              </p>
              <h1 className="font-display text-4xl font-bold text-[#1B4D3E] sm:text-5xl">
                Upcoming performances, workshops, and school gatherings
              </h1>
              <p className="max-w-2xl text-base text-[#4A5E52] sm:text-lg">
                Follow the latest concerts, recitals, learning sessions, and community events.
              </p>
            </div>

            <Button variant="outline" className="w-fit border-[#C9922A] bg-white/80" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#1B4D3E]">Event Calendar</h2>
              <p className="text-sm text-[#4A5E52]">
                {events.length} published {events.length === 1 ? "event" : "events"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <div className="rounded-xl border border-[#E8D5A3] bg-white/70 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8B621D]">
                  Upcoming
                </p>
                <p className="font-display text-2xl font-bold text-[#1B4D3E]">
                  {groupedEvents.upcoming.length}
                </p>
              </div>
              <div className="rounded-xl border border-[#E8D5A3] bg-white/70 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8B621D]">
                  Past
                </p>
                <p className="font-display text-2xl font-bold text-[#1B4D3E]">
                  {groupedEvents.past.length}
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <Card className="border-dashed border-[#C9922A] bg-white/70">
              <CardContent className="flex flex-col items-center px-6 py-16 text-center">
                <p className="text-sm text-[#4A5E52]">Loading events...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-dashed border-[#C9922A] bg-white/70">
              <CardContent className="flex flex-col items-center px-6 py-16 text-center">
                <p className="text-sm text-[#4A5E52]">Unable to load events.</p>
              </CardContent>
            </Card>
          ) : events.length === 0 ? (
            <Card className="border-dashed border-[#C9922A] bg-white/70">
              <CardContent className="flex flex-col items-center px-6 py-16 text-center">
                <UploadCloud className="mb-4 h-10 w-10 text-[#C9922A]" />
                <h3 className="font-display text-2xl font-semibold text-[#1B4D3E]">
                  No events published yet
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#4A5E52]">
                  Once the admin publishes an event, the details and poster will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList className="h-auto w-full justify-start rounded-xl border border-[#E8D5A3] bg-[#FDF6EC] p-1 sm:w-fit">
                <TabsTrigger
                  value="upcoming"
                  className="gap-2 rounded-lg px-5 py-2.5 data-[state=active]:bg-[#1B4D3E] data-[state=active]:text-[#FDF6EC]"
                >
                  <Clock className="h-4 w-4" />
                  Upcoming
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="gap-2 rounded-lg px-5 py-2.5 data-[state=active]:bg-[#1B4D3E] data-[state=active]:text-[#FDF6EC]"
                >
                  <History className="h-4 w-4" />
                  Past Events
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-0">
                {renderEventCards(
                  groupedEvents.upcoming,
                  "No upcoming events",
                  "Past events are still available in the Past Events tab.",
                )}
              </TabsContent>

              <TabsContent value="past" className="mt-0">
                {renderEventCards(
                  groupedEvents.past,
                  "No past events yet",
                  "Completed events will appear here after their end time.",
                )}
              </TabsContent>

              {canLoadMore ? (
                <div className="mt-10 flex justify-center">
                  <Button
                    variant="outline"
                    className="border-[#C9922A] bg-white/80"
                    onClick={() => setVisibleLimit((limit) => limit + PAGE_SIZE)}
                    disabled={isLoading}
                  >
                    Load more
                  </Button>
                </div>
              ) : null}
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Events;
