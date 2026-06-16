"use client";
import {
  getEvent,
  getCurrentUser,
} from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";


import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Calendar,
  Clock,
  MapPin,
  Users,
} from "lucide-react";

export default function EventDetailsPage() {
  const params = useParams();

  const [event, setEvent] =
    useState<any>(null);

  const [role, setRole] =
    useState<string | null>(null);
useEffect(() => {
  async function loadData() {
    try {
      const token =
        localStorage.getItem("token");

      if (token) {
        const user =
          await getCurrentUser(token);

        setRole(user.role);
      }

      const data =
        await getEvent(
          Number(params.id)
        );

      setEvent(data);
    } catch (error) {
      console.error(error);
    }
  }

  loadData();
}, [params]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">

      {/* Hero Banner */}
     
<div className="relative h-[450px] overflow-hidden">
  {event.image_url ? (
  <img
  src={event.image_url}
  alt={event.title}
  className="w-full h-full object-cover rounded-b-3xl"
/>
  ) : (
    <div className="w-full h-full bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600" />
  )}

  <div className="absolute inset-0 bg-black/20" />
</div>



<div className="max-w-6xl mx-auto px-6 -mt-16 relative z-10">
        {/* Main Card */}
      <Card className="rounded-2xl shadow-lg bg-background">
  <CardContent className="p-8">

    <h1 className="text-4xl font-bold mb-4">
      {event.title}
    </h1>

   <p
  className="
    text-muted-foreground
    mb-4
    line-clamp-3
    break-words
  "
>
  {event.description}
</p>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">

              <Card className="rounded-2xl shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">

                    <MapPin className="w-5 h-5" />

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Location
                      </p>

                      <p className="text-sm text-muted-foreground">
  📍 {
    event.location.length > 60
      ? event.location.slice(0, 60) + "..."
      : event.location
  }
</p>
                    </div>

                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">

                    <Calendar className="w-5 h-5" />

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Start Date
                      </p>

                      <p className="font-medium">
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
                      </p>
                    </div>

                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">

                    <Clock className="w-5 h-5" />

                    <div>
                      <p className="text-sm text-muted-foreground">
                        End Date
                      </p>

                      <p className="font-medium">
                        {new Date(
                          event.end_date
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
                      </p>
                    </div>

                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-8">

              {(role === "admin" ||
                role === "organizer") && (
                <Link
                  href={`/events/${event.id}/participants`}
                >
                  <Button size="lg">
                    <Users className="w-4 h-4 mr-2" />
                    View Participants
                  </Button>
                </Link>
              )}

              <Link href="/events">
                <Button
                  size="lg"
                  variant="outline"
                >
                  Back to Events
                </Button>
              </Link>

            </div>

          </CardContent>
        </Card>

        {/* Additional Description */}
        <Card className="mt-8 mb-10 rounded-2xl shadow-sm">
          <CardContent className="p-8">

            <h2 className="text-2xl font-semibold mb-4">
              About This Event
            </h2>

            <p className="text-muted-foreground leading-7">
              {event.description}
            </p>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}