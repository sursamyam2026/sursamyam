import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { eventsStore } from "@/lib/events";
import type { EventItem } from "@/lib/events";
import { ArrowLeft, CalendarDays, Clock, MapPin } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function formatDateTime(value: string, time?: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
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

const EventDetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadEvent() {
      if (!eventId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        const nextEvent = await eventsStore.getById(eventId);
        if (!isMounted) return;
        setEvent(nextEvent);
        setNotFound(!nextEvent || !nextEvent.isPublished);
      } catch {
        if (!isMounted) return;
        setNotFound(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadEvent();

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  if (notFound) {
    return <Navigate to="/events" replace />;
  }

  if (isLoading || !event) {
    return (
      <div className="min-h-screen bg-[#FDF6EC]">
        <Navbar />
        <main className="px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <Card className="mx-auto max-w-5xl border-dashed border-[#C9922A] bg-white/70">
            <CardContent className="flex flex-col items-center px-6 py-16 text-center">
              <p className="text-sm text-[#4A5E52]">Loading event...</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <Navbar />
      <main className="px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-5xl">
          <div className="mb-6">
            <Button variant="outline" className="border-[#C9922A] bg-white/80" asChild>
              <Link to="/events">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Link>
            </Button>
          </div>

          <Card variant="elevated" className="overflow-hidden border-[#E0C88B] bg-white">
            <div className="bg-[#F5ECD7]">
              <img
                src={event.posterSrc}
                alt={`${event.title} poster`}
                className="max-h-[72vh] w-full object-contain"
              />
            </div>
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="space-y-3">
                <h1 className="break-words font-display text-4xl font-bold leading-tight text-[#1B4D3E] sm:text-5xl">
                  {event.title}
                </h1>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-[#E8D5A3] bg-[#FDF6EC]/70 p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8B621D]">
                      <CalendarDays className="h-4 w-4" />
                      Starts
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-[#1B4D3E]">
                      {formatDateTime(event.eventDate, event.eventTime)}
                    </p>
                  </div>

                  {event.eventEndDate ? (
                    <div className="rounded-xl border border-[#E8D5A3] bg-[#FDF6EC]/70 p-4">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8B621D]">
                        <Clock className="h-4 w-4" />
                        Ends
                      </p>
                      <p className="mt-2 text-sm font-medium leading-6 text-[#1B4D3E]">
                        {formatDateTime(event.eventEndDate, event.eventEndTime)}
                      </p>
                    </div>
                  ) : null}

                  {event.venue ? (
                    <div className="rounded-xl border border-[#E8D5A3] bg-[#FDF6EC]/70 p-4">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8B621D]">
                        <MapPin className="h-4 w-4" />
                        Venue
                      </p>
                      <p className="mt-2 break-words text-sm font-medium leading-6 text-[#1B4D3E]">
                        {event.venue}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {event.description ? (
                <div className="rounded-xl border border-[#E8D5A3] bg-[#FDF6EC]/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B621D]">
                    Details
                  </p>
                  <div className="mt-3 max-w-3xl whitespace-pre-line break-words text-base leading-8 text-[#4A5E52]">
                    {event.description}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default EventDetails;
