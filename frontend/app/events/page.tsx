"use client";

import EventCard from "@/components/app/EventCard";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getEvents,
  deleteEvent,
  registerForEvent,
  getCurrentUser,
  getMyRegistrations,
  getMyTeamRegistrations,
} from "@/lib/api";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";


import {
  Plus,
  Search,
} from "lucide-react";

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] =
    useState<any[]>([]);
  const [registeredEvents, setRegisteredEvents] =
  useState<number[]>([]);  

  const [role, setRole] =
    useState("user");
  const [search, setSearch] =
    useState("");
  const [filter, setFilter] =
    useState("all");  
  async function handleDelete(
    eventId: number
  ) {
    const token =
      localStorage.getItem("token");

    if (!token) {
      toast.error(
        "Please login first"
      );
      return;
    }

    await deleteEvent(
      token,
      eventId
    );

    setEvents(
      events.filter(
        (event) =>
          event.id !== eventId
      )
    );
  }

  async function handleRegister(
  eventId: number
) {
  const token =
    localStorage.getItem("token");

  if (!token) {
    toast.error(
      "Please login first"
    );
    return;
  }

  try {
    const result =
      await registerForEvent(
        token,
        eventId
      );

    

    if (result.detail) {
      toast.error(
        result.detail
      );
      return;
    }

    toast.success(
      "Registered successfully!"
    );
setRegisteredEvents((prev) => [
  ...prev,
  eventId,
]);
    router.push(
      `/pass/${
        result.registration_id ??
        result.id
      }`
    );
  } catch (error) {
    console.error(error);

    toast.error(
      "Failed to register."
    );
  }
}
  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
const [
  eventsData,
  registrations,
  teamRegistrations,
] = await Promise.all([
  getEvents(),
  getMyRegistrations(token!),
  getMyTeamRegistrations(token!),
]);

setEvents(eventsData);

setRegisteredEvents([
  ...registrations.map(
    (r: any) => r.event_id
  ),

  ...teamRegistrations.map(
    (t: any) => t.event_id
  ),
]);

const user =
  await getCurrentUser(
    token!
  );

        setRole(
          user.role || "user"
        );
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, [router]);

  const isAdmin =
    role === "admin";
    const now = new Date();

const upcomingCount =
  events.filter(
    (e) =>
      new Date(e.start_date) > now
  ).length;

const endedCount =
  events.filter(
    (e) =>
      new Date(e.end_date) < now
  ).length;

const ongoingCount =
  events.filter(
    (e) =>
      new Date(e.start_date) <= now &&
      new Date(e.end_date) >= now
  ).length;
const filteredEvents =
  events.filter((event) => {
    const text = `
      ${event.title}
      ${event.description}
      ${event.location}
    `.toLowerCase();

    const matchesSearch =
      search
        .toLowerCase()
        .split(" ")
        .every((word) =>
          text.includes(word)
        );

    const isUpcoming =
      new Date(
        event.start_date
      ) > now;

    const isEnded =
      new Date(
        event.end_date
      ) < now;

    const isOngoing =
      !isUpcoming &&
      !isEnded;

    const matchesFilter =
      filter === "all" ||
      (filter === "upcoming" &&
        isUpcoming) ||
      (filter === "ongoing" &&
        isOngoing) ||
      (filter === "ended" &&
        isEnded);

    return (
      matchesSearch &&
      matchesFilter
    );
  });
  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">
              Discover Events
            </h1>

            <p className="text-muted-foreground text-lg mt-3">
              Register Now, attend and manage events seamlessly.
            </p>
          </div>

          {isAdmin && (
            <Link href="/create-event">
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          )}
        </div>
<div className="relative mb-6">

  <Search
    className="
      absolute
      left-4
      top-1/2
      -translate-y-1/2
      h-5
      w-5
      text-muted-foreground
    "
  />

  <input
    type="text"
    placeholder="Search events..."
    value={search}
    onChange={(e) =>
      setSearch(e.target.value)
    }
    className="
      w-full
      rounded-2xl
      border
      bg-background
      pl-12
      pr-4
      py-4
      shadow-sm
      focus:outline-none
      focus:ring-2
      focus:ring-violet-500
    "
  />
</div>
<div className="flex flex-wrap gap-2 mb-8">

  <Button
    size="sm"
    variant={
      filter === "all"
        ? "default"
        : "outline"
    }
    onClick={() =>
      setFilter("all")
    }
  >
    All ({events.length})
  </Button>

  <Button
    size="sm"
    variant={
      filter === "upcoming"
        ? "default"
        : "outline"
    }
    onClick={() =>
      setFilter("upcoming")
    }
  >
    Upcoming ({upcomingCount})
  </Button>

  <Button
    size="sm"
    variant={
      filter === "ongoing"
        ? "default"
        : "outline"
    }
    onClick={() =>
      setFilter("ongoing")
    }
  >
    Ongoing ({ongoingCount})
  </Button>

  <Button
    size="sm"
    variant={
      filter === "ended"
        ? "default"
        : "outline"
    }
    onClick={() =>
      setFilter("ended")
    }
  >
    Ended ({endedCount})
  </Button>

</div>
   

        {/* Events Grid */}
       <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.length === 0 ? (
  <div className="col-span-full">
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-8 text-center">
        No events found.
      </CardContent>
    </Card>
  </div>
) : (
  filteredEvents.map((event) => (
  <EventCard
  key={event.id}
  event={event}
  isAdmin={isAdmin}
  onRegister={handleRegister}
  onDelete={handleDelete}
  isRegistered={registeredEvents.includes(
    event.id
  )}
/>
))
)}

        </div>

      </div>
    </div>
  );
}