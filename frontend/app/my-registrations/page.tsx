"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  getMyRegistrations,
  unregisterFromEvent,
} from "@/lib/api";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Ticket,
  Calendar,
  Trash2,
  CheckCircle,
} from "lucide-react";

import { toast } from "sonner";

export default function MyRegistrationsPage() {
  const router = useRouter();

  const [registrations, setRegistrations] =
    useState<any[]>([]);

  async function handleUnregister(
    eventId: number
  ) {
    const token =
      localStorage.getItem("token");

    if (!token) return;

    try {
      await unregisterFromEvent(
        token,
        eventId
      );

      setRegistrations(
        registrations.filter(
          (registration) =>
            registration.event_id !== eventId
        )
      );

      toast.success(
        "Registration cancelled"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to unregister"
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
        const data =
          await getMyRegistrations(token!);

        setRegistrations(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(error);

        setRegistrations([]);
      }
    }

    loadData();
  }, [router]);

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-5xl font-bold">
            My Registrations
          </h1>

          <p className="text-muted-foreground text-lg mt-3">
            Manage your event passes and registrations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                Total Registrations
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {registrations.length}
              </h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                Active Passes
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {registrations.length}
              </h2>
            </CardContent>
          </Card>
        </div>

        {/* DEBUG - remove later */}
        

        {registrations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Ticket className="w-14 h-14 mx-auto mb-4 text-muted-foreground" />

              <h2 className="text-2xl font-bold">
                No Registrations Yet
              </h2>

              <p className="text-muted-foreground mt-2">
                Register for an event to see your passes here.
              </p>

              <Link href="/events">
                <Button className="mt-6">
                  Browse Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {registrations.map(
              (registration) => (
                <Card
                  key={registration.id}
                  className="hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold">
                          {registration.event?.title}
                        </h2>

                        <div className="space-y-2 mt-3">

  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Calendar className="w-4 h-4" />

    <span>
  {new Date(
    registration.registered_at
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
</span>
  </div>

  <div className="text-sm text-muted-foreground">
    📍 {registration.event?.location}
  </div>

</div>
                      </div>

                      <Badge>
                        Active
                      </Badge>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />

                      <span className="text-sm">
                        Registration Confirmed
                      </span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <Link
                        href={`/pass/${registration.id}`}
                      >
                        <Button>
                          <Ticket className="w-4 h-4 mr-2" />
                          View Pass
                        </Button>
                      </Link>

                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleUnregister(
                            registration.event_id
                          )
                        }
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Unregister
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}