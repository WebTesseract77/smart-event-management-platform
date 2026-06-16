"use client";
import StatCard from "@/components/app/StatCard";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getEvents,
  getMyRegistrations,
  getCurrentUser,
  getAnalytics,  
} from "@/lib/api";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Calendar,
  Ticket,
  User,
  Plus,
  ArrowRight,
  QrCode,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const [eventCount, setEventCount] =
    useState(0);

  const [
    registrationCount,
    setRegistrationCount,
  ] = useState(0);

  const [isAdmin, setIsAdmin] =
    useState(false);
   const [upcomingCount, setUpcomingCount] =
  useState(0);

const [completedCount, setCompletedCount] =
  useState(0);

const [activePasses, setActivePasses] =
  useState(0); 
const [analytics, setAnalytics] =
  useState<any>(null);
  useEffect(() => {
    async function loadData() {
      try {
        const events =
          await getEvents();

        setEventCount(
          Array.isArray(events)
            ? events.length
            : 0
        );
const now = new Date();

setUpcomingCount(
  events.filter(
    (event: any) =>
      new Date(event.start_date) >
      now
  ).length
);

setCompletedCount(
  events.filter(
    (event: any) =>
      new Date(event.end_date) <
      now
  ).length
);
        const token =
          localStorage.getItem(
            "token"
          );

        if (token) {
          const registrations =
  await getMyRegistrations(
    token
  );

;
          setRegistrationCount(
            Array.isArray(
              registrations
            )
              ? registrations.length
              : 0
          );
const now = new Date();

setActivePasses(
  registrations.filter(
    (registration: any) =>
      new Date(
        registration.event.end_date
      ) >= new Date()
  ).length
);
          const user =
            await getCurrentUser(
              token
            );

          setIsAdmin(
            user.role === "admin"
          );
          if (user.role === "admin") {
  const analyticsData =
  await getAnalytics(
    token
  );

setAnalytics(
  analyticsData
);

  
}
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-5xl font-bold">
            Dashboard
          </h1>

          <p className="text-muted-foreground text-lg mt-3">
            Welcome back to Smart Event
            Management Platform.
          </p>
        </div>
{isAdmin && analytics ? (
  <>
    <div className="grid md:grid-cols-3 gap-4 mb-6">      <StatCard
        title="Total Events"
        value={analytics.total_events}
        icon={<Calendar className="h-6 w-6" />}
      />

      <StatCard
        title="Registrations"
        value={analytics.total_registrations}
        icon={<Ticket className="h-6 w-6" />}
      />

      <StatCard
        title="Attendance Rate"
        value={`${analytics.attendance_rate}%`}
        icon={<TrendingUp className="h-6 w-6" />}
      />
    </div>

    <Card
  className="
    rounded-2xl
    shadow-sm
    hover:shadow-md
    hover:-translate-y-1
    transition-all
    duration-300
    mb-8
  "
>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">
          Platform Insights
        </h2>

        <div className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground">
              Most Popular Event
            </p>

            <p className="text-lg font-semibold">
              {analytics.most_popular_event}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Upcoming Events
              </p>

              <p className="text-2xl font-bold">
                {analytics.upcoming_events}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Attendance Efficiency
              </p>

              <p className="text-2xl font-bold">
                {analytics.attendance_rate}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </>
) : (

<div className="grid md:grid-cols-3 gap-4 mb-8">

  <StatCard
    title="My Registrations"
    value={registrationCount}
    icon={<Ticket className="h-6 w-6" />}
  />

  <StatCard
    title="Active Passes"
    value={activePasses}
    icon={<QrCode className="h-6 w-6" />}
  />

  <StatCard
    title="Events Available"
    value={eventCount}
    icon={<Calendar className="h-6 w-6" />}
  />

</div>

)}

       <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">

          {isAdmin && (
            <Link href="/create-event">
             <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-8">

                  <Plus className="w-8 h-8 mb-4 text-violet-600" />

                  <h3 className="font-semibold text-lg">
                    Create Event
                  </h3>

                  <p className="text-sm text-muted-foreground mt-2">
                    Organize a new event.
                  </p>

                </CardContent>
              </Card>
            </Link>
          )}

          <Link href="/events">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-8">

                <Calendar className="w-8 h-8 mb-4 text-violet-600" />

                <h3 className="font-semibold text-lg">
                  Browse Events
                </h3>

                <p className="text-sm text-muted-foreground mt-2">
                  Discover upcoming events.
                </p>

              </CardContent>
            </Card>
          </Link>

          <Link href="/my-registrations">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-8">

                <Ticket className="w-8 h-8 mb-4 text-violet-600" />

                <h3 className="font-semibold text-lg">
                  My Passes
                </h3>

                <p className="text-sm text-muted-foreground mt-2">
                  View your registrations.
                </p>

              </CardContent>
            </Card>
          </Link>

          {isAdmin && (
            <Link href="/scanner">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-8">

                  <QrCode className="w-8 h-8 mb-4 text-violet-600" />

                  <h3 className="font-semibold text-lg">
                    Scanner
                  </h3>

                  <p className="text-sm text-muted-foreground mt-2">
                    Verify attendee QR passes.
                  </p>

                </CardContent>
              </Card>
            </Link>
          )}

          <Link href="/profile">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-8">

                <User className="w-8 h-8 mb-4 text-violet-600" />

                <h3 className="font-semibold text-lg">
                  Profile
                </h3>

                <p className="text-sm text-muted-foreground mt-2">
                  Manage your account.
                </p>

              </CardContent>
            </Card>
          </Link>

        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-8">

            <h2 className="text-2xl font-bold">
              Platform Overview
            </h2>

            <p className="text-muted-foreground mt-3">
              Manage events, register attendees,
              generate QR-based event passes,
              and track attendance from a
              single platform.
            </p>

            <Link href="/events">
              <Button className="mt-6">
                Explore Events
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}