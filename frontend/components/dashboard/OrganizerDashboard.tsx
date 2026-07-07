"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import StatCard from "@/components/app/StatCard";
import { EmptyState } from "@/components/app/FeedbackStates";
import { Calendar, BookUser, CheckCircle2, Plus, ClipboardCheck, Zap } from "lucide-react";
import ActionCard from "./ActionCard";
import CompactEventCard from "@/components/dashboard/CompactEventCard";
import SectionHeading from "@/components/dashboard/SectionHeading";
import { itemReveal } from "./dashboardAnimations";

export default function OrganizerDashboard({
  userId,
  events,
}: {
  userId: number;
  events: any[];
}) {
  const myEvents = events.filter((event) => event.created_by === userId);
  const myEventCount = myEvents.length;
  const myParticipantCount = myEvents.reduce((sum, event) => sum + (event.registered_count || 0), 0);
  const upcomingEventsCount = myEvents.filter((event) => event.start_date && new Date(event.start_date) > new Date()).length;
  const attendanceRecordsCount = myEvents.reduce((sum, event) => sum + (event.attendance_count || 0), 0);

  return (
    <>
      <motion.section variants={itemReveal} className="mb-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="My Events" value={myEventCount} icon={<Calendar className="h-6 w-6" />} />
          <StatCard title="Total Participants" value={myParticipantCount} icon={<BookUser className="h-6 w-6" />} />
          <StatCard title="Upcoming Events" value={upcomingEventsCount} icon={<Calendar className="h-6 w-6" />} />
          <StatCard title="Attendance Records" value={attendanceRecordsCount} icon={<CheckCircle2 className="h-6 w-6" />} />
        </div>
      </motion.section>

      <motion.section variants={itemReveal} className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard href="/organizer/events" title="My Events" description="Review and manage the events you created." icon={<Calendar className="h-5 w-5" />} />
        <ActionCard href="/create-event" title="Create Event" description="Start a new organizer event." icon={<Plus className="h-5 w-5" />} />
        <ActionCard href="/organizer/events" title="View Participants" description="Open participant lists via My Events." icon={<BookUser className="h-5 w-5" />} />
        <ActionCard href="/organizer/events" title="Attendance Tracker" description="Open attendance from your event management page." icon={<ClipboardCheck className="h-5 w-5" />} />
      </motion.section>

      <motion.section variants={itemReveal} className="mb-8 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-3xl border border-[#E8E1D5] bg-white shadow-sm">
          <CardContent className="p-6">
            <SectionHeading eyebrow="My Events" title="Organizer workspace" icon={<Calendar className="h-5 w-5" />} />
            <div className="space-y-4">
              {myEvents.length ? (
                myEvents.slice(0, 3).map((event) => (
                  <CompactEventCard
                    key={event.id}
                    item={{
                      id: `org-event-${event.id}`,
                      title: event.title,
                      date: event.start_date ? new Date(event.start_date).toLocaleDateString() : "Upcoming",
                      location: event.location || "Location not set",
                    }}
                  />
                ))
              ) : (
                <EmptyState
                  icon={<Calendar className="h-5 w-5" />}
                  title="No events yet"
                  description="Create your first event to start managing attendees."
                  actionLabel="Create Event"
                  actionHref="/create-event"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-[#E8E1D5] bg-white shadow-sm">
          <CardContent className="p-6">
            <SectionHeading eyebrow="Quick Actions" title="Get things done" icon={<Zap className="h-5 w-5" />} />
            <div className="space-y-4">
              <div className="rounded-2xl border bg-[#F5F2EA] border-[#E8E1D5] p-4">
                <p className="text-sm text-muted-foreground">My events</p>
                <p className="mt-2 text-3xl font-semibold">{myEventCount}</p>
              </div>
              <div className="rounded-2xl border border-[#E8E1D5] bg-[#F5F2EA] p-4">
                <p className="text-sm text-muted-foreground">Total participants</p>
                <p className="mt-2 text-3xl font-semibold">{myParticipantCount}</p>
              </div>
              <div className="rounded-2xl border bg-[#F5F2EA] border-[#E8E1D5] p-4">
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="mt-2 text-base font-semibold">Open from My Events to track live check-ins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </>
  );
}