"use client";

import StatCard from "@/components/app/StatCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  getMyTeamRegistrations,
  getMyRegistrations,
  unregisterFromEvent,
} from "@/lib/api";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Ticket,
  Calendar,
  Trash2,
  CheckCircle,
  MapPin,
} from "lucide-react";

import { toast } from "sonner";

export default function MyRegistrationsPage() {
  const router = useRouter();

  const [registrations, setRegistrations] =
    useState<any[]>([]);

  const [
    teamRegistrations,
    setTeamRegistrations,
  ] = useState<any[]>([]);

  const activePasses =
    registrations.filter(
      (registration) =>
        registration.event?.end_date &&
        new Date(
          registration.event.end_date
        ) >= new Date()
    ).length;

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
        const [
          data,
          teamData,
        ] = await Promise.all([
          getMyRegistrations(token!),
          getMyTeamRegistrations(token!),
        ]);

        setRegistrations(
          Array.isArray(data)
            ? data
            : []
        );

        setTeamRegistrations(
          Array.isArray(teamData)
            ? teamData
            : []
        );
      } catch (error) {
        console.error(error);
        setRegistrations([]);
        setTeamRegistrations([]);
      }
    }

    loadData();
  }, [router]);

  return (
  <div className="min-h-screen bg-muted/30 p-8 pt-20">
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

          <StatCard
            title="Total Registrations"
            value={registrations.length}
            icon={
              <Ticket className="h-6 w-6" />
            }
          />

          <StatCard
            title="Active Passes"
            value={activePasses}
            icon={
              <CheckCircle className="h-6 w-6" />
            }
          />

        </div>

        {registrations.length === 0 ? (
          <Card className="rounded-2xl shadow-sm">
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
          <div className="grid lg:grid-cols-2 gap-6">

            {registrations.map(
              (registration) => (
                <Card
                  key={registration.id}
                  className="
                    rounded-2xl
                    shadow-sm
                    hover:shadow-md
                    hover:-translate-y-1
                    transition-all
                    duration-300
                  "
                >
                  <CardContent className="p-6">

                    <div className="flex justify-between items-start">

                      <div>

                        <h2 className="text-xl font-bold">
                          {registration.event?.title}
                        </h2>

                        <div className="space-y-3 mt-4">

                          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">

                            <Calendar className="h-4 w-4 text-violet-600" />

                            <div>
                              <p className="text-xs text-muted-foreground">
                                Event Date
                              </p>

                              <p className="text-sm font-medium">
                                {registration.event?.start_date
                                  ? new Date(
                                      registration.event.start_date
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
                                    )
                                  : "Date unavailable"}
                              </p>
                            </div>

                          </div>

                          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">

                            <MapPin className="h-4 w-4 text-violet-600" />

                            <div>
                              <p className="text-xs text-muted-foreground">
                                Location
                              </p>

                              <p className="text-sm font-medium">
                                {registration.event?.location}
                              </p>
                            </div>

                          </div>

                        </div>

                      </div>

                     <Badge
  className={
    registration.event?.end_date &&
    new Date(
      registration.event.end_date
    ) >= new Date()
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700"
  }
>
  {registration.event?.end_date &&
  new Date(
    registration.event.end_date
  ) >= new Date()
    ? "Active"
    : "Completed"}
</Badge>

                    </div>

                    <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 rounded-lg px-3 py-2">

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
                        disabled={
                          registration.event
                            ?.start_date &&
                          new Date(
                            registration.event.start_date
                          ) <= new Date()
                        }
                        onClick={() =>
                          handleUnregister(
                            registration.event_id
                          )
                        }
                      >
                        <Trash2 className="w-4 h-4 mr-2" />

                        {registration.event
                          ?.start_date &&
                        new Date(
                          registration.event.start_date
                        ) <= new Date()
                          ? "Event Started"
                          : "Unregister"}
                      </Button>

                    </div>

                  </CardContent>
                </Card>
              )
            )}
{teamRegistrations.map(
  (team) => (
    <Card
      key={team.team_id}
      className="
        rounded-2xl
        shadow-sm
        hover:shadow-md
        hover:-translate-y-1
        transition-all
        duration-300
      "
    >
      <CardContent className="p-6">
        <Badge className="bg-violet-100 text-violet-700">
  Team Event
</Badge>
        <h2 className="text-xl font-bold">
          {team.team_name}
        </h2>

        <p className="text-muted-foreground mt-2">
          {team.event_title}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`/team-pass/${team.team_id}`}
          >
         <div className="space-y-3 mt-4">

  <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">

    <Ticket className="h-4 w-4 text-violet-600" />

    <div>
      <p className="text-xs text-muted-foreground">
        Event
      </p>

      <p className="text-sm font-medium">
        {team.event_title}
      </p>
    </div>

  </div>

  <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">

    <Ticket className="h-4 w-4 text-violet-600" />

    <div>
      <p className="text-xs text-muted-foreground">
        Team ID
      </p>

      <p className="text-sm font-medium">
        #{team.team_id}
      </p>
    </div>

  </div>

</div>   
            <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 rounded-lg px-3 py-2">
  <CheckCircle className="w-4 h-4" />
  <span className="text-sm">
    Team Registration Confirmed
  </span>
</div>
            <Button>
              <Ticket className="w-4 h-4 mr-2" />
              View Team Pass
            </Button>
          </Link>
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
