"use client";

import EventCard from "@/components/app/EventCard";
import EventCardSkeleton from "@/components/app/EventCardSkeleton";
import EventToolbar from "@/components/app/EventToolbar";
import { toast } from "sonner";
import Script from "next/script";
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
import { Search, Sparkles, Ticket } from "lucide-react";
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
  const isOrganizer = role === "organizer";
  const now = new Date();

  const upcomingCount = events.filter((e) => new Date(e.start_date) > now).length;
  const endedCount = events.filter((e) => new Date(e.end_date) < now).length;
  const ongoingCount = events.filter(
    (e) => new Date(e.start_date) <= now && new Date(e.end_date) >= now
  ).length;

 const query = search.trim().toLowerCase();

function similarity(source: string, target: string) {
  if (!target) return 1;

  source = source.toLowerCase();
  target = target.toLowerCase();

  if (source === target) return 10000;

  let score = 0;

  if (source.startsWith(target)) score += 5000;

  if (source.includes(target)) score += 3000;

  const sourceWords = source.split(/[\s,-]+/);
  const targetWords = target.split(/\s+/);

  for (const word of targetWords) {
    for (const sourceWord of sourceWords) {
      if (sourceWord === word) score += 800;

      if (sourceWord.startsWith(word)) score += 600;

      if (sourceWord.includes(word)) score += 350;

      if (
        sourceWord.length > 3 &&
        word.length > 2 &&
        sourceWord.startsWith(word.slice(0, word.length - 1))
      ) {
        score += 250;
      }

      if (
        sourceWord.length > 4 &&
        word.length > 3 &&
        sourceWord.includes(word.slice(0, word.length - 2))
      ) {
        score += 120;
      }
    }
  }

  return score;
}

const filteredEvents = events
  .map((event) => {
    const title = event.title ?? "";
    const description = event.description ?? "";
    const location = event.location ?? "";

    const now = new Date();

    const isUpcoming =
      new Date(event.start_date) > now;

    const isEnded =
      new Date(event.end_date) < now;

    const isOngoing =
      !isUpcoming && !isEnded;

    const matchesFilter =
      filter === "all" ||
      (filter === "upcoming" && isUpcoming) ||
      (filter === "ongoing" && isOngoing) ||
      (filter === "ended" && isEnded);

    let score = 1;

    if (query) {
      score =
        similarity(title, query) * 10 +
        similarity(description, query) * 2 +
        similarity(location, query);
    }

    return {
      event,
      score,
      matchesFilter,
    };
  })
  .filter(
    (item) =>
      item.matchesFilter &&
      (query === "" || item.score > 0)
  )
  .sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return (
      new Date(a.event.start_date).getTime() -
      new Date(b.event.start_date).getTime()
    );
  })
  .map((item) => item.event);

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
    <div className="min-h-screen bg-[#FAF8F4]">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,#FAF8F4,#F5F2EA)]" />
        <div className="mx-auto max-w-[1280px] px-3 py-5 sm:px-5 sm:py-8 lg:py-10">
        {loading ? (
          <div className="space-y-7">
            <PageHeaderSkeleton />
            <div className="rounded-[24px] border border-[#E8E1D5] bg-white p-4 shadow-[0_12px_32px_rgba(15,77,63,0.05)] backdrop-blur-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-11 rounded-[14px] bg-[#F5F2EA]" />
                <div className="flex flex-wrap gap-2">
                  <div className="h-10 w-20 rounded-full bg-[#F5F2EA]" />
                  <div className="h-10 w-24 rounded-full bg-[#F5F2EA]" />
                  <div className="h-10 w-20 rounded-full bg-[#F5F2EA]" />
                  <div className="h-10 w-20 rounded-full bg-[#F5F2EA]" />
                </div>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <EventCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-7 flex flex-col gap-5 rounded-[24px] border border-[#E8E1D5] bg-white p-4 shadow-[0_12px_32px_rgba(15,77,63,0.05)] sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E1D5] bg-[#F5F2EA] px-4 py-2 text-sm font-semibold text-[#183028] shadow-sm">
                    <Sparkles className="h-4 w-4 text-[#0F4D3F]" />
                    Discover Events
                  </div>

                 <h1 className="mt-6 max-w-full break-words font-serif text-[2.6rem] leading-[0.95] tracking-[-0.05em] text-[#183028] sm:text-[4rem]">
                      Discover events that inspire.
                 </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5E665F]">
                    Explore workshops, hackathons, seminars, cultural festivals, and competitions happening across your campus.
                  </p>
                </div>

                <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E1D5] bg-[#F5F2EA] px-4 py-2 text-sm font-medium text-[#183028] shadow-sm">
                    <Ticket className="h-4 w-4" />
                    {events.length} events
                  </div>

                  
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
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedEvents.map((event) => (
                    <EventCard 
  key={event.id}
  event={event}
  role={role || ""}
  canManage={
    isAdmin ||
    (isOrganizer && event.created_by === user?.id)
  }
  onRegister={handleRegister}
  onDelete={handleDelete}
  isRegistered={registeredEvents.includes(event.id)}
/>
                  ))}
                </div>

                {filteredEvents.length > 9 && (
                  <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[28px] border border-[#E8E1D5] bg-white px-6 py-5 shadow-[0_12px_32px_rgba(15,77,63,0.05)] sm:flex-row">
                    <p className="text-sm text-[#5E665F]">
                      Page <span className="font-semibold text-foreground">{page}</span> of{" "}
                      <span className="font-semibold text-foreground">{totalPages}</span>
                    </p>

                    <div className="flex max-w-full flex-wrap items-center justify-center gap-2">
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
                            variant="outline"
                            onClick={() => setPage(current)}
                            className={
                              page === current
                                ? "h-10 w-10 rounded-full border-[#0F4D3F] bg-[#0F4D3F] p-0 text-white hover:bg-[#0B3E33]"
                                : "h-10 w-10 rounded-full border-[#E8E1D5] bg-white p-0 text-[#183028] hover:bg-[#F5F2EA]"
                            }
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
                        className="rounded-full border-[#E8E1D5] bg-white px-5 hover:bg-[#F5F2EA]"
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
