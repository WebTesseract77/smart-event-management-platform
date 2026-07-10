"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import StatCard from "@/components/app/StatCard";
import { EmptyState } from "@/components/app/FeedbackStates";
import { Calendar, Ticket, Shield, Activity, Layers3, Users } from "lucide-react";
import ActionCard from "./ActionCard";
import CompactEventCard from "@/components/dashboard/CompactEventCard";
import SectionHeading from "@/components/dashboard/SectionHeading";
import { itemReveal } from "./dashboardAnimations";

export default function AdminDashboard({
  eventCount,
  registrationCount,
  analytics,
  events,
}: {
  eventCount: number;
  registrationCount: number;
  activePasses: number;
  analytics: any;
  events: any[];
  registrations: any[];
}) {
  return (
    <>
      <motion.section variants={itemReveal} className="mb-8" id="analytics">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard title="Total Users" value={analytics?.total_users ?? "N/A"} icon={<Users className="h-6 w-6" />} />
          <StatCard title="Total Events" value={analytics?.total_events ?? eventCount} icon={<Calendar className="h-6 w-6" />} />
          <StatCard title="Organizers Count" value={analytics?.organizers_count ?? "N/A"} icon={<Shield className="h-6 w-6" />} />
          <StatCard title="Total Registrations" value={analytics?.total_registrations ?? registrationCount} icon={<Ticket className="h-6 w-6" />} />
        </div>
      </motion.section>

      <motion.section
  variants={itemReveal}
  className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
>
        <ActionCard href="/admin/users" title="Manage Users" description="Promote or demote platform users." icon={<Shield className="h-5 w-5" />} />
        <ActionCard href="/events" title="View Events" description="Review and manage the event list." icon={<Calendar className="h-5 w-5" />} />
        <ActionCard href="/events" title="Platform Analytics" description="Inspect platform performance." icon={<Activity className="h-5 w-5" />} />
      </motion.section>

      <motion.section
  variants={itemReveal}
  className="mb-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-[0.95fr_1.05fr]"
>
        <Card className="rounded-3xl border border-[#E8E1D5] bg-white shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <SectionHeading eyebrow="Recent Events" title="Event management" icon={<Layers3 className="h-5 w-5" />} />
            <div className="space-y-4">
              {events.slice(0, 3).length ? (
                events.slice(0, 3).map((event: any) => (
                  <CompactEventCard
                    key={event.id}
                    item={{
                      id: `admin-event-${event.id}`,
                      title: event.title ?? "Event",
                      date: event.start_date ? new Date(event.start_date).toLocaleDateString() : "Upcoming",
                      location: event.location ?? "Location not set",
                    }}
                  />
                ))
              ) : (
                <EmptyState
                  icon={<Calendar className="h-5 w-5" />}
                  title="No events available"
                  description="No organizer events have been created yet."
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-[#E8E1D5] bg-white shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <SectionHeading eyebrow="Recent Activity" title="Registration overview" icon={<Users className="h-5 w-5" />} />
            <div className="space-y-4">
              <div className="rounded-2xl border bg-[#F5F2EA] border-[#E8E1D5] p-4">
                <p className="text-sm text-muted-foreground">Total registrations</p>
                <p className="mt-2 text-3xl font-semibold">{analytics?.total_registrations ?? registrationCount}</p>
              </div>
              <div className="rounded-2xl border bg-[#F5F2EA] border-[#E8E1D5] p-4">
                <p className="text-sm text-muted-foreground">Attendance rate</p>
                <p className="mt-2 text-3xl font-semibold">{analytics ? `${analytics.attendance_rate}%` : "N/A"}</p>
              </div>
              <div className="rounded-2xl border bg-[#F5F2EA] border-[#E8E1D5] p-4">
                <p className="text-sm text-muted-foreground">Most popular event</p>
                <p className="mt-2 text-lg font-semibold">{analytics?.most_popular_event ?? "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </>
  );
}