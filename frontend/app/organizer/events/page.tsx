"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  Calendar,
  Clock3,
  ImageIcon,
  MapPin,
  Pencil,
  Plus,
  Search,
  Ticket,
  Trash2,
  Users,
  Eye,
  Activity,
} from "lucide-react";

import {
  deleteEvent,
  getCurrentUser,
  getOrganizerEvents,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  EmptyState,
  PageHeaderSkeleton,
} from "@/components/app/FeedbackStates";

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getEventStatus(startDate: string, endDate: string) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now > end) return "Ended";
  if (now >= start && now <= end) return "Live";
  return "Upcoming";
}

function statusClasses(status: string) {
  if (status === "Live") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  }

  if (status === "Ended") {
    return "bg-muted text-muted-foreground";
  }

  return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
}

function OrganizerEventSkeleton() {
  return (
    <Card className="overflow-hidden rounded-[2rem] border bg-background/85 shadow-sm">
      <div className="aspect-[16/9] animate-pulse bg-gradient-to-br from-muted/60 to-muted/30" />
      <CardContent className="space-y-4 p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="h-5 w-3/4 rounded-full bg-muted/70" />
            <div className="h-7 w-20 rounded-full bg-muted/60" />
          </div>
          <div className="h-4 w-full rounded-full bg-muted/60" />
          <div className="h-4 w-5/6 rounded-full bg-muted/60" />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="h-11 rounded-2xl bg-muted/60" />
          <div className="h-11 rounded-2xl bg-muted/60" />
          <div className="h-11 rounded-2xl bg-muted/60" />
          <div className="h-11 rounded-2xl bg-muted/60" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="h-9 rounded-full bg-muted/60" />
          <div className="h-9 rounded-full bg-muted/60" />
          <div className="h-9 rounded-full bg-muted/60" />
          <div className="h-9 rounded-full bg-muted/60" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrganizerEventsPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [events, setEvents] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

        const data = await getOrganizerEvents(currentToken!);
        setUser(currentUser);
        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load your events");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const stats = useMemo(() => {
    const now = new Date();

    return {
      total: events.length,
      upcoming: events.filter((event) => new Date(event.start_date) > now).length,
      live: events.filter((event) => {
        const start = new Date(event.start_date);
        const end = new Date(event.end_date);
        return now >= start && now <= end;
      }).length,
      registrations: events.reduce(
        (total, event) => total + (Number(event.registered_count) || 0),
        0
      ),
    };
  }, [events]);

  async function handleDelete(eventId: number) {
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
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      toast.success("Event deleted");
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
        <div className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.09),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.1),transparent_30%)]" />
          <div className="mx-auto max-w-7xl px-6 py-8 lg:py-10">
            <div className="space-y-8">
              <PageHeaderSkeleton />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-3xl bg-muted/60" />
                ))}
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <OrganizerEventSkeleton key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "organizer") {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.09),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.1),transparent_30%)]" />

        <motion.div
          className="mx-auto max-w-7xl px-6 py-8 lg:py-10"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.74)_100%)] shadow-2xl shadow-violet-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.88)_0%,rgba(24,24,27,0.62)_100%)]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-3xl">
                    <p className="inline-flex items-center gap-2 rounded-full border bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">
                      <Activity className="h-3.5 w-3.5" />
                      Organizer workspace
                    </p>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                      My Events
                    </h1>
                    <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
                      Manage the events you created, track registrations, and stay on top of
                      participants and attendance.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
                      <Ticket className="h-4 w-4" />
                      {stats.total} events
                    </div>

                    <Link href="/create-event">
                      <Button size="lg" className="rounded-full px-5">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Event
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="My Events" value={stats.total} icon={<Calendar className="h-5 w-5" />} />
              <StatCard title="Upcoming" value={stats.upcoming} icon={<Clock3 className="h-5 w-5" />} />
              <StatCard title="Live Now" value={stats.live} icon={<Activity className="h-5 w-5" />} />
              <StatCard title="Registrations" value={stats.registrations} icon={<Users className="h-5 w-5" />} />
            </div>

            {events.length === 0 ? (
              <EmptyState
                icon={<Search className="h-5 w-5" />}
                title="No events created yet."
                description="Create your first event to start managing registrations, participants, and attendance."
                actionLabel="Create Your First Event"
                actionHref="/create-event"
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => {
                  const status = getEventStatus(event.start_date, event.end_date);

                  return (
                    <motion.div
                      key={event.id}
                      whileHover={reduceMotion ? undefined : { y: -6 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Card className="group h-full overflow-hidden rounded-[2rem] border bg-background/90 shadow-sm transition-all duration-300 hover:border-violet-200/80 hover:shadow-2xl hover:shadow-violet-500/10 dark:hover:border-violet-500/30">
                        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-violet-500/15 via-blue-500/10 to-transparent">
                          {event.image_url ? (
                            <motion.img
                              src={event.image_url}
                              alt={event.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <div className="rounded-full border border-dashed border-violet-400/30 bg-background/70 p-5 text-violet-600 backdrop-blur-sm dark:text-violet-300">
                                <ImageIcon className="h-6 w-6" />
                              </div>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

                          <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
                            <Badge className={`rounded-full px-2 py-0.5 text-[10px] ${statusClasses(status)}`}>
                              {status}
                            </Badge>
                            <Badge className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 dark:bg-slate-500/15 dark:text-slate-300">
                              {event.is_team_event ? "Team" : "Individual"}
                            </Badge>
                            <Badge className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                              {event.is_paid_event ? "Paid" : "Free"}
                            </Badge>
                          </div>

                          <div className="absolute bottom-4 left-4">
                            <div className="inline-flex items-center gap-2 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-medium text-foreground shadow-lg backdrop-blur-md">
                              <Calendar className="h-3 w-3 text-violet-600" />
                              <span className="truncate">{formatDate(event.start_date)}</span>
                            </div>
                          </div>
                        </div>

                        <CardContent className="flex h-full flex-col p-5">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="line-clamp-1 text-[1.15rem] font-bold tracking-tight text-foreground">
                                  {event.title}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
                                  {event.description}
                                </p>
                              </div>
                              <Badge className="shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                                {event.is_paid_event ? `₹${event.registration_fee || 0}` : "Free"}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <MetaPill
                                icon={<MapPin className="h-3.5 w-3.5" />}
                                label="Location"
                                value={event.location}
                              />
                              <MetaPill
                                icon={<Users className="h-3.5 w-3.5" />}
                                label="Registrations"
                                value={String(event.registered_count ?? 0)}
                              />
                              <MetaPill
                                icon={<Clock3 className="h-3.5 w-3.5" />}
                                label="Deadline"
                                value={formatDate(event.registration_deadline)}
                              />
                              <MetaPill
                                icon={<Ticket className="h-3.5 w-3.5" />}
                                label="Type"
                                value={event.is_team_event ? "Team" : "Individual"}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <Link href={`/organizer/events/${event.id}`} className="min-w-0">
                                <Button
                                  variant="outline"
                                  className="h-9 w-full rounded-full px-3 text-sm"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Event
                                </Button>
                              </Link>
                              <Link href={`/edit-event/${event.id}`} className="min-w-0">
                                <Button
                                  variant="outline"
                                  className="h-9 w-full rounded-full px-3 text-sm"
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Event
                                </Button>
                              </Link>
                              <Link href={`/organizer/events/${event.id}/participants`} className="min-w-0">
                                <Button
                                  variant="outline"
                                  className="h-9 w-full rounded-full px-3 text-sm"
                                >
                                  <Users className="mr-2 h-4 w-4" />
                                  Participants
                                </Button>
                              </Link>
                              <Link href={`/organizer/events/${event.id}/attendance`} className="min-w-0">
                                <Button
                                  variant="outline"
                                  className="h-9 w-full rounded-full px-3 text-sm"
                                >
                                  <Activity className="mr-2 h-4 w-4" />
                                  Attendance
                                </Button>
                              </Link>
                              <Button
                                variant="destructive"
                                className="h-9 w-full rounded-full px-3 text-sm md:col-span-2"
                                onClick={() => handleDelete(event.id)}
                                disabled={actionLock}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Event
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: ReactNode }) {
  return (
    <Card className="rounded-3xl border bg-background/80 shadow-sm backdrop-blur-sm">
      <CardContent className="flex h-full items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="rounded-2xl bg-violet-100 p-3 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function MetaPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-background/70 px-3 py-2.5 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <span className="text-violet-600 dark:text-violet-300">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
