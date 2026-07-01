"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  Activity,
  ArrowRight,
  Calendar,
  CreditCard,
  ImageIcon,
  MapPin,
  Pencil,
  Ticket,
  Trash2,
  Users,
} from "lucide-react";

import {
  deleteEvent,
  getCurrentUser,
  getOrganizerEvent,
  getOrganizerEventAttendance,
  getOrganizerEventParticipants,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageHeaderSkeleton } from "@/components/app/FeedbackStates";

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatCard({
  title,
  value,
  helper,
  icon,
}: {
  title: string;
  value: string | number;
  helper?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-3xl border bg-background/80 shadow-sm backdrop-blur-sm">
      <CardContent className="flex h-full items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 line-clamp-1 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {helper ? <p className="mt-2 text-xs text-muted-foreground">{helper}</p> : null}
        </div>
        <div className="rounded-2xl bg-violet-100 p-3 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <Card className="rounded-2xl border bg-background/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-violet-100 p-2 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {title}
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionRow({
  icon,
  title,
  subtitle,
  href,
  onClick,
  destructive = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href?: string;
  onClick?: () => void;
  destructive?: boolean;
}) {
  const row = (
    <div
      className={`group flex w-full items-center justify-between gap-3 rounded-2xl border border-white/70 bg-background/80 px-4 py-3 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-background hover:shadow-md hover:shadow-violet-500/10 dark:border-white/10 ${
        destructive ? "hover:border-red-300/70 dark:hover:border-red-500/50" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`rounded-xl p-2 ${
            destructive
              ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300"
              : "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5" />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {row}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {row}
    </button>
  );
}

export default function OrganizerEventDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const eventId = Number(params.id);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [actionLock, setActionLock] = useState(false);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        const currentUser = await getCurrentUser(currentToken!);

        if (currentUser.role !== "organizer") {
          window.alert("Access denied.");
          router.push("/events");
          return;
        }

        const [eventData, participantsData, attendanceData] = await Promise.all([
          getOrganizerEvent(currentToken!, eventId),
          getOrganizerEventParticipants(currentToken!, eventId),
          getOrganizerEventAttendance(currentToken!, eventId),
        ]);

        setEvent(eventData);
        setParticipants(Array.isArray(participantsData) ? participantsData : []);
        setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventId, router]);

  const now = new Date();
  const startDate = event ? new Date(event.start_date) : null;
  const endDate = event ? new Date(event.end_date) : null;
  const deadlineDate = event ? new Date(event.registration_deadline) : null;
  const isCompleted = endDate ? now > endDate : false;
  const isLive = startDate && endDate ? now >= startDate && now <= endDate : false;
  const registrationClosed = deadlineDate ? now > deadlineDate : false;
  const status = isCompleted ? "Ended" : isLive ? "Live" : "Upcoming";
  const isTeamEvent = Boolean(event?.is_team_event);
  const isPaid = Boolean(event?.is_paid_event);
  const registeredCount = Number(event?.registered_count || participants.length || 0);
  const attendanceCount = attendance.length;
  const attendanceRate =
    registeredCount > 0 ? Math.round((attendanceCount / registeredCount) * 100) : 0;
  const capacityFilled = event?.capacity ? Math.round((registeredCount / event.capacity) * 100) : 0;
  const revenue =
    isPaid && registeredCount > 0 && event?.registration_fee != null
      ? Number(event.registration_fee) * registeredCount
      : null;

  async function handleDelete() {
    if (actionLock) return;

    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    setActionLock(true);
    try {
      await deleteEvent(currentToken!, eventId);
      toast.success("Event deleted");
      router.push("/organizer/events");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete event");
    } finally {
      setActionLock(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:py-10">
          <div className="space-y-6">
            <PageHeaderSkeleton />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-3xl bg-muted/60" />
              ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.9fr)]">
              <div className="space-y-6">
                <div className="h-[28rem] animate-pulse rounded-[2.25rem] bg-background/80" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-24 animate-pulse rounded-3xl bg-background/80" />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-[22rem] animate-pulse rounded-[2rem] bg-background/80" />
                <div className="h-44 animate-pulse rounded-[2rem] bg-background/80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-muted/30 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <EmptyState
            icon={<Calendar className="h-5 w-5" />}
            title="Event not found"
            description="This event may no longer exist or you may not have access to it."
            actionLabel="Back to My Events"
            actionHref="/organizer/events"
          />
        </div>
      </div>
    );
  }

  const priceLabel = isPaid
    ? `₹${Number(event.registration_fee || 0).toLocaleString("en-IN")}`
    : "Free";
  const deadlineLabel = deadlineDate ? formatDateTime(deadlineDate.toISOString()) : "Unavailable";
  const startLabel = startDate ? formatDateTime(startDate.toISOString()) : "Unavailable";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.14),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.1),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.08),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.18),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.14),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.12),transparent_30%)]" />

        <motion.div
          className="mx-auto max-w-7xl px-6 py-8 lg:py-10"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.9fr)] lg:items-start">
            <div className="space-y-8">
              <Card className="overflow-hidden rounded-[2.25rem] border border-white/70 bg-background/90 shadow-lg shadow-slate-900/5 dark:border-white/10">
                <div className="relative h-[480px] min-h-[480px] overflow-hidden bg-gradient-to-br from-violet-500/20 via-blue-500/12 to-transparent sm:h-[500px] lg:h-[520px]">
                  {event.image_url ? (
                    <motion.img
                      src={event.image_url}
                      alt={event.title}
                      className="h-full w-full object-cover"
                      whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-violet-600/70" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.12)_0%,rgba(15,23,42,0.24)_35%,rgba(15,23,42,0.84)_100%)]" />

                  <div className="absolute left-5 right-5 top-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
                        {status}
                      </Badge>
                      <Badge className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
                        {isTeamEvent ? "Team Event" : "Individual Event"}
                      </Badge>
                      <Badge className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
                        {priceLabel}
                      </Badge>
                    </div>
                    <div className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
                      {registeredCount}/{event.capacity}
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8">
                    <div className="max-w-4xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
                          <Calendar className="h-3.5 w-3.5 text-violet-200" />
                          {startLabel}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
                          <MapPin className="h-3.5 w-3.5 text-violet-200" />
                          {event.location}
                        </div>
                      </div>

                      <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight text-white drop-shadow-md sm:text-6xl lg:text-7xl">
                        {event.title}
                      </h1>

                      <p className="mt-5 max-w-3xl text-base leading-7 text-white/90 sm:text-lg">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid gap-6">
                <Card className="rounded-3xl border bg-background/90 shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
                      Overview
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">Organizer insights</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <StatCard title="Registration Status" value={registrationClosed ? "Closed" : "Open"} icon={<Ticket className="h-5 w-5" />} />
                      <StatCard title="Upcoming Event" value={isCompleted ? "Ended" : isLive ? "Live now" : "Upcoming"} icon={<Calendar className="h-5 w-5" />} />
                      <StatCard title="Event Type" value={isTeamEvent ? "Team" : "Individual"} icon={<Users className="h-5 w-5" />} />
                      <StatCard title="Payment Status" value={isPaid ? "Paid" : "Free"} icon={<CreditCard className="h-5 w-5" />} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border bg-background/90 shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
                      Event information
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">Core details</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <InfoCard icon={<Calendar className="h-4 w-4" />} title="Date" value={startLabel} />
                      <InfoCard icon={<MapPin className="h-4 w-4" />} title="Location" value={event.location || "Unavailable"} />
                      <InfoCard icon={<Ticket className="h-4 w-4" />} title="Registration Deadline" value={deadlineLabel} />
                      <InfoCard icon={<Users className="h-4 w-4" />} title="Capacity" value={String(event.capacity ?? "Unavailable")} />
                      <InfoCard icon={<CreditCard className="h-4 w-4" />} title="Price" value={priceLabel} />
                      <InfoCard icon={<Activity className="h-4 w-4" />} title="Teams Registered" value={isTeamEvent ? String(participants.length) : "N/A"} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border bg-background/90 shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
                      Recent activity
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">Latest registrations</h2>
                    <div className="mt-4">
                      {participants.length === 0 ? (
                        <EmptyState
                          icon={<Users className="h-5 w-5" />}
                          title="No recent registrations."
                          description="Registrations will appear here once attendees sign up."
                        />
                      ) : (
                        <div className="grid gap-3">
                          {participants.slice(0, 5).map((participant) => (
                            <div
                              key={participant.id}
                              className="flex items-center justify-between gap-4 rounded-2xl border bg-background/80 px-4 py-3"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-foreground">{participant.name}</p>
                                <p className="truncate text-sm text-muted-foreground">{participant.email}</p>
                              </div>
                              <Badge className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                                Registered
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-4 lg:sticky lg:top-24">
              <Card className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(124,58,237,0.08)_0%,rgba(255,255,255,0.92)_20%,rgba(255,255,255,0.96)_100%)] shadow-lg shadow-violet-500/5 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(124,58,237,0.16)_0%,rgba(24,24,27,0.94)_20%,rgba(24,24,27,0.98)_100%)]">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
                        Quick summary
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                        Registration status
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {isTeamEvent ? "Manage this team event from one command center." : "Manage this event from one command center."}
                      </p>
                    </div>
                    <div className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold text-violet-700 shadow-sm dark:bg-violet-500/15 dark:text-violet-300">
                      {priceLabel}
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Attendance</span>
                      <span className="font-medium text-foreground">{attendanceCount}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Attendance %</span>
                      <span className="font-medium text-foreground">{attendanceRate}%</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Capacity Filled</span>
                      <span className="font-medium text-foreground">{capacityFilled}%</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Count</span>
                        <span className="font-medium text-foreground">{registeredCount}/{event.capacity}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200/90 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 via-violet-500 to-blue-600 shadow-sm shadow-violet-600/30"
                          style={{ width: `${Math.min(100, capacityFilled)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <ActionRow
                      href={`/events/${event.id}`}
                      icon={<ArrowRight className="h-4 w-4" />}
                      title="View Public Event"
                      subtitle="Open the attendee-facing event page"
                    />
                    <ActionRow
                      href={`/edit-event/${event.id}`}
                      icon={<Pencil className="h-4 w-4" />}
                      title="Edit Event"
                      subtitle="Update the event setup"
                    />
                    <ActionRow
                      href={`/organizer/events/${event.id}/participants`}
                      icon={<Users className="h-4 w-4" />}
                      title="Participants"
                      subtitle="See the participant list"
                    />
                    <ActionRow
                      href={`/organizer/events/${event.id}/attendance`}
                      icon={<Activity className="h-4 w-4" />}
                      title="Attendance"
                      subtitle="Open the organizer attendance tools"
                    />
                    <ActionRow
                      icon={<Trash2 className="h-4 w-4" />}
                      title="Delete Event"
                      subtitle="Remove this event"
                      destructive
                      onClick={handleDelete}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border bg-background/90 shadow-lg shadow-violet-500/5 dark:border-white/10">
                <CardContent className="p-5 sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
                    Organizer insights
                  </p>
                  <div className="mt-4 grid gap-3">
                    <InfoCard icon={<Ticket className="h-4 w-4" />} title="Registration Status" value={registrationClosed ? "Closed" : "Open"} />
                    <InfoCard icon={<Calendar className="h-4 w-4" />} title="Upcoming Event" value={isCompleted ? "Ended" : isLive ? "Live now" : "Upcoming"} />
                    <InfoCard icon={<Users className="h-4 w-4" />} title="Event Type" value={isTeamEvent ? "Team" : "Individual"} />
                    <InfoCard icon={<CreditCard className="h-4 w-4" />} title="Payment Status" value={isPaid ? "Paid" : "Free"} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
