"use client";

import EventCard from "@/components/app/EventCard";
import EventCardSkeleton from "@/components/app/EventCardSkeleton";
import EventToolbar from "@/components/app/EventToolbar";
import { toast } from "sonner";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getEvents,
  deleteEvent,
  getCurrentUser,
  getMyRegistrations,
  getMyTeamRegistrations,
} from "@/lib/api";
import { runEventRegistration } from "@/lib/event-registration";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  PageHeaderSkeleton,
} from "@/components/app/FeedbackStates";
import { Plus, Search, Sparkles, Ticket } from "lucide-react";

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [role, setRole] = useState("user");
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [actionLock, setActionLock] = useState(false);
  const [loading, setLoading] = useState(true);

  async function handleDelete(eventId: number) {
    if (actionLock) {
      return;
    }
    setActionLock(true);
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      setActionLock(false);
      return;
    }

    try {
      await deleteEvent(token, eventId);

      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } finally {
      setActionLock(false);
    }
  }

  async function handleRegister(eventId: number) {
    if (actionLock) {
      return;
    }
    setActionLock(true);
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      setActionLock(false);
      return;
    }

    try {
      const event = events.find((e: any) => e.id === eventId);

      if (!event) {
        toast.error("Event not found");
        setActionLock(false);
        return;
      }

      await runEventRegistration({
        token,
        eventId,
        isPaidEvent: Boolean(event.is_paid_event),
        eventTitle: event.title,
        userName: user?.name,
        userEmail: user?.email,
        onSuccess: (registrationId) => {
          toast.success(event.is_paid_event ? "Registration Successful!" : "Registered successfully!");
          if (!event.is_paid_event) {
            setRegisteredEvents((prev) => [...prev, eventId]);
          }
          router.push(`/pass/${registrationId}`);
        },
        onError: (message) => {
          toast.error(message);
        },
        onPaymentCancelled: () => {
          toast.error("Payment cancelled");
        },
        setActionLock,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to register.");
    } finally {
      setActionLock(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        const [eventsData, registrations, teamRegistrations] = await Promise.all([
          getEvents(),
          getMyRegistrations(token!),
          getMyTeamRegistrations(token!),
        ]);

        setEvents(eventsData);

        setRegisteredEvents([
          ...registrations.map((r: any) => r.event_id),
          ...teamRegistrations.map((t: any) => t.event_id),
        ]);

        const currentUser = await getCurrentUser(token!);

        setUser(currentUser);
        setRole(currentUser.role || "user");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  const isAdmin = role === "admin";
  const now = new Date();

  const upcomingCount = events.filter((e) => new Date(e.start_date) > now).length;
  const endedCount = events.filter((e) => new Date(e.end_date) < now).length;
  const ongoingCount = events.filter(
    (e) => new Date(e.start_date) <= now && new Date(e.end_date) >= now
  ).length;

  const filteredEvents = events.filter((event) => {
    const text = `${event.title} ${event.description} ${event.location}`.toLowerCase();

    const matchesSearch = search
      .toLowerCase()
      .split(" ")
      .every((word) => text.includes(word));

    const isUpcoming = new Date(event.start_date) > now;
    const isEnded = new Date(event.end_date) < now;
    const isOngoing = !isUpcoming && !isEnded;

    const matchesFilter =
      filter === "all" ||
      (filter === "upcoming" && isUpcoming) ||
      (filter === "ongoing" && isOngoing) ||
      (filter === "ended" && isEnded);

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / 9));
  const paginatedEvents = useMemo(
    () => filteredEvents.slice((page - 1) * 9, page * 9),
    [filteredEvents, page]
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="min-h-screen bg-muted/30">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.09),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.10),transparent_30%)]" />
      <div className="mx-auto max-w-7xl px-6 py-8 lg:py-10">
        {loading ? (
          <div className="space-y-8">
            <PageHeaderSkeleton />
            <div className="rounded-[2rem] border bg-background/80 p-4 shadow-sm backdrop-blur">
              <div className="animate-pulse space-y-4">
                <div className="h-14 rounded-2xl bg-muted/70" />
                <div className="flex flex-wrap gap-2">
                  <div className="h-10 w-24 rounded-full bg-muted/70" />
                  <div className="h-10 w-28 rounded-full bg-muted/70" />
                  <div className="h-10 w-24 rounded-full bg-muted/70" />
                  <div className="h-10 w-24 rounded-full bg-muted/70" />
                </div>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <EventCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-5 rounded-[2rem] border bg-background/75 p-6 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm font-medium shadow-sm">
                    <Sparkles className="h-4 w-4 text-violet-600" />
                    Discover Events
                  </div>

                  <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-6xl">
                    Discover Events
                  </h1>

                  <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
                    Explore curated events, join registrations, and manage your passes from a
                    polished EventSphere workspace.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
                    <Ticket className="h-4 w-4" />
                    {events.length} events
                  </div>

                  {isAdmin && (
                    <Link href="/create-event">
                      <Button size="lg" className="rounded-full px-5">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Event
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <EventToolbar
              search={search}
              onSearchChange={setSearch}
              filter={filter}
              onFilterChange={setFilter}
              counts={{
                all: events.length,
                upcoming: upcomingCount,
                ongoing: ongoingCount,
                ended: endedCount,
              }}
            />

            {filteredEvents.length === 0 ? (
              <div className="mt-8">
                <EmptyState
                  icon={<Search className="h-5 w-5" />}
                  title="No events found"
                  description="Try a different search or filter."
                  actionLabel="Browse Events"
                  actionHref="/events"
                />
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isAdmin={isAdmin}
                      onRegister={handleRegister}
                      onDelete={handleDelete}
                      isRegistered={registeredEvents.includes(event.id)}
                    />
                  ))}
                </div>

                {filteredEvents.length > 9 && (
                  <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[1.5rem] border bg-background/80 px-5 py-4 shadow-sm backdrop-blur sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                      Page <span className="font-semibold text-foreground">{page}</span> of{" "}
                      <span className="font-semibold text-foreground">{totalPages}</span>
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={page === 1}
                        className="rounded-full px-4"
                      >
                        Previous
                      </Button>

                      {Array.from({ length: totalPages }).map((_, index) => {
                        const current = index + 1;
                        return (
                          <Button
                            key={current}
                            size="sm"
                            variant={page === current ? "default" : "outline"}
                            onClick={() => setPage(current)}
                            className="h-9 w-9 rounded-full p-0 transition-all duration-300"
                          >
                            {current}
                          </Button>
                        );
                      })}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={page === totalPages}
                        className="rounded-full px-4"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
