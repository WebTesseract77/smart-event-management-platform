"use client";

import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getEvents,
  deleteEvent,
  registerForEvent,
  getCurrentUser,
} from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Calendar,
  MapPin,
  Pencil,
  Trash2,
  UserPlus,
  Plus,
} from "lucide-react";

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] =
    useState<any[]>([]);

  const [role, setRole] =
    useState("user");

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
        const eventsData =
          await getEvents();

        setEvents(eventsData);

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

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-4">

          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                Total Events
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {events.length}
              </h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                Upcoming
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {events.length}
              </h2>
            </CardContent>
          </Card>

          

        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {events.map((event) => (
            <Card
              key={event.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >

              {event.image_url ? (
  <img
    src={event.image_url}
    alt={event.title}
    className="h-32 w-full object-cover"
  />
) : (
  <div className="h-32 bg-gradient-to-r from-blue-600 to-violet-600" />
)}

              <CardHeader>
                <div className="flex justify-between items-start">

                  <CardTitle className="text-xl">
                    {event.title}
                  </CardTitle>

                  <Badge>
                    Active
                  </Badge>

                </div>
              </CardHeader>

              <CardContent>

                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {event.description}
                </p>

                <div className="space-y-3 mb-6">

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
  <Calendar className="w-4 h-4" />
  {new Date(
    event.start_date
  ).toLocaleString(
    "en-IN",
    {
      timeZone:
        "Asia/Kolkata",
      dateStyle:
        "medium",
      timeStyle:
        "short",
    }
  )}
</div>

                </div>

                <div className="flex flex-wrap gap-2">

                  <Link
                    href={`/events/${event.id}`}
                  >
                    <Button size="sm">
                      View
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleRegister(
                        event.id
                      )
                    }
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Register
                  </Button>

                  {isAdmin && (
                    <>
                      <Link
                        href={`/edit-event/${event.id}`}
                      >
                        <Button
                          size="sm"
                          variant="secondary"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleDelete(
                            event.id
                          )
                        }
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>

                      <Link
                        href={`/attendance/${event.id}`}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          Attendance
                        </Button>
                      </Link>
                    </>
                  )}

                </div>

              </CardContent>

            </Card>
          ))}

        </div>

      </div>
    </div>
  );
}