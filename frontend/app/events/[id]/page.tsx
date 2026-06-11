"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getEvent } from "@/lib/api";

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

  useEffect(() => {
    async function loadEvent() {
      const data = await getEvent(
        Number(params.id)
      );

      setEvent(data);
    }

    loadEvent();
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
      <div className="h-72 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600" />

      <div className="max-w-6xl mx-auto px-6 -mt-24">
        {/* Main Card */}
        <Card className="shadow-2xl">
          <CardContent className="p-8">
            <h1 className="text-5xl font-bold">
              {event.title}
            </h1>

            <p className="text-muted-foreground text-lg mt-4">
              {event.description}
            </p>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5" />

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Location
                      </p>

                      <p className="font-medium">
                        {event.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
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

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" />

                    <div>
                      <p className="text-sm text-muted-foreground">
                        End Date
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
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href={`/events/${event.id}/participants`}
              >
                <Button size="lg">
                  <Users className="w-4 h-4 mr-2" />
                  View Participants
                </Button>
              </Link>

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
        <Card className="mt-8 mb-10">
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