"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import StatCard from "@/components/app/StatCard";
import { EmptyState } from "@/components/app/FeedbackStates";
import { Ticket, Calendar, QrCode, TrendingUp, Users, Layers3 } from "lucide-react";
import ActionCard from "./ActionCard";
import RegistrationCard from "./RegistrationCard";
import CompactEventCard from "@/components/dashboard/CompactEventCard";
import SectionHeading from "@/components/dashboard/SectionHeading";
import { RegistrationItem, UpcomingItem } from "./dashboardTypes";
import { itemReveal } from "./dashboardAnimations";

export default function UserDashboard({
  eventCount,
  registrationCount,
  upcomingCount,
  activePasses,
  registrations,
  events,
}: {
  eventCount: number;
  registrationCount: number;
  upcomingCount: number;
  activePasses: number;
  registrations: any[];
  events: any[];
}) {
  const recentRegistrations = useMemo<RegistrationItem[]>(
    () =>
      registrations.slice(0, 3).map((registration: any, index) => ({
        id: `registration-${registration.id ?? index}`,
        title: registration.event?.title ?? "Registration",
        date: registration.event?.start_date ? new Date(registration.event.start_date).toLocaleDateString() : "Date unavailable",
        location: registration.event?.location ?? "Location unavailable",
        status: registration.status ?? "Active",
        passId: registration.id,
      })),
    [registrations]
  );

  const upcomingEvents = useMemo<UpcomingItem[]>(
    () =>
      events
        .filter((event: any) => new Date(event.start_date) > new Date())
        .slice(0, 3)
        .map((event: any, index) => ({
          id: `upcoming-${event.id ?? index}`,
          title: event.title ?? "Upcoming Event",
          date: event.start_date ? new Date(event.start_date).toLocaleDateString() : "Upcoming",
          location: event.location ?? "Location not set",
        })),
    [events]
  );

  return (
    <>
    
      <motion.section variants={itemReveal} className="mb-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-4">
          <StatCard title="Registered Events" value={registrationCount} icon={<Ticket className="h-6 w-6" />} />
          <StatCard title="Upcoming Events" value={upcomingCount} icon={<Calendar className="h-6 w-6" />} />
          <StatCard title="Active QR Passes" value={activePasses} icon={<QrCode className="h-6 w-6" />} />
          <StatCard title="Events Available" value={eventCount} icon={<TrendingUp className="h-6 w-6" />} />
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section
  variants={itemReveal}
  className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
>
        <ActionCard href="/events" title="Browse Events" description="Discover upcoming events." icon={<Calendar className="h-5 w-5" />} />
        <ActionCard href="/my-registrations" title="My Registrations" description="View your event passes." icon={<Ticket className="h-5 w-5" />} />
        <ActionCard href="/profile" title="Profile" description="Manage your account." icon={<Users className="h-5 w-5" />} />
      </motion.section>

      {/* Main Dashboard Grid */}
      <motion.section
  variants={itemReveal}
  className="mb-8 grid gap-4 sm:gap-6 xl:grid-cols-[1.2fr_0.8fr] items-start"
>
        {/* Left: Recent Registrations */}
        <div className="flex flex-col gap-6 w-full h-full justify-start">
          {recentRegistrations.length > 0 ? (
            <div className="flex flex-col gap-6 w-full">
              <RegistrationCard item={recentRegistrations[0]} />
              {recentRegistrations.length > 1 && (
                <div className="grid gap-4 sm:grid-cols-2 w-full items-stretch">
                  {recentRegistrations[1] && <RegistrationCard item={recentRegistrations[1]} />}
                  {recentRegistrations[2] && <RegistrationCard item={recentRegistrations[2]} />}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col h-full min-h-[300px]">
              <EmptyState
                icon={<Ticket className="h-5 w-5" />}
                title="No registrations yet"
                description="Browse events to get started."
                actionLabel="Browse Events"
                actionHref="/events"
              />
            </div>
          )}
        </div>

        {/* Right: Upcoming Events */}
        <Card className="rounded-3xl border border-[#E8E1D5] bg-white shadow-sm h-full flex flex-col w-full">
          <CardContent className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 h-full">
            <SectionHeading eyebrow="Upcoming Events" title="Plan ahead" icon={<Layers3 className="h-5 w-5" />} />
            <div className="space-y-4 flex-1">
              {upcomingEvents.length ? (
                upcomingEvents.map((event) => <CompactEventCard key={event.id} item={event} />)
              ) : (
                <EmptyState
                  icon={<Calendar className="h-5 w-5" />}
                  title="No upcoming events"
                  description="Check back soon for new events."
                  actionLabel="Browse Events"
                  actionHref="/events"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </>
  );
}