"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

import {
  getCurrentUser,
  getOrganizerEventAttendance,
  getOrganizerEvents,
} from "@/lib/api";
import { AttendanceScanner } from "@/components/app/AttendanceScanner";
import { EmptyState, PageHeaderSkeleton } from "@/components/app/FeedbackStates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function countBadgeClass(tone: "violet" | "emerald" | "sky") {
  if (tone === "emerald") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  if (tone === "sky") return "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300";
  return "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300";
}

export default function OrganizerAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const eventId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);

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

        const events = await getOrganizerEvents(currentToken!);
        const selectedEvent = events.find((item: any) => item.id === eventId);

        if (!selectedEvent) {
          setEvent(null);
          setAttendance([]);
          return;
        }

        setEvent(selectedEvent);

        const attendanceData = await getOrganizerEventAttendance(currentToken!, eventId);
        setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventId, router]);

  const checkedInCount = attendance.length;

  const attendanceByUser = useMemo(
    () => new Map(attendance.map((record) => [Number(record.user_id), record])),
    [attendance]
  );

  async function refreshAttendance() {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return;

    try {
      const attendanceData = await getOrganizerEventAttendance(currentToken, eventId);
      setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:py-10">
          <div className="space-y-6">
            <PageHeaderSkeleton />
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-3xl bg-muted/60" />
              ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-[2rem] border bg-background/85 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-10 w-64 rounded-full bg-muted/70" />
                    <div className="h-8 w-80 rounded-full bg-muted/60" />
                    <div className="h-[380px] rounded-[1.5rem] bg-muted/60" />
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-[2rem] border bg-background/85 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-10 w-56 rounded-full bg-muted/70" />
                    <div className="h-8 w-72 rounded-full bg-muted/60" />
                    <div className="h-8 w-52 rounded-full bg-muted/60" />
                  </div>
                  <div className="mt-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="h-14 rounded-2xl bg-muted/60" />
                    ))}
                  </div>
                </CardContent>
              </Card>
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
            icon={<Activity className="h-5 w-5" />}
            title="Event not found"
            description="This event may no longer exist or you may not have access to it."
            actionLabel="Back to My Events"
            actionHref="/organizer/events"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.09),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.1),transparent_30%)]" />

        <motion.div
          className="mx-auto max-w-7xl px-6 py-8 lg:py-10"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.76)_100%)] shadow-2xl shadow-violet-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.88)_0%,rgba(24,24,27,0.62)_100%)]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-3xl">
                    <p className="inline-flex items-center gap-2 rounded-full border bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">
                      <Activity className="h-3.5 w-3.5" />
                      Organizer Attendance
                    </p>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                      {event.title}
                    </h1>
                    <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
                      Scan attendee QR codes and track live attendance for this event.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${countBadgeClass("violet")}`}>
                      <Users className="h-4 w-4" />
                      {checkedInCount} checked in
                    </div>
                    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${countBadgeClass("emerald")}`}>
                      <Clock3 className="h-4 w-4" />
                      {event.registered_count ?? 0} registered
                    </div>
                    <Link href="/organizer/events">
                      <Button variant="outline" className="rounded-full px-4">
                        Back to My Events
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-4">
              <StatCard title="Checked In" value={checkedInCount} icon={<CheckCircle2 className="h-5 w-5" />} />
              <StatCard title="Registered" value={event.registered_count ?? 0} icon={<Users className="h-5 w-5" />} />
              <StatCard title="Date" value={formatDate(event.start_date)} icon={<Calendar className="h-5 w-5" />} />
              <StatCard title="Location" value={event.location} icon={<MapPin className="h-5 w-5" />} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <AttendanceScanner
                mode="organizer"
                eventId={eventId}
                title="Attendance Scanner"
                description="Scan QR passes for this event. The scan will mark attendance only for this organizer-owned event."
                onRecorded={refreshAttendance}
              />

              <Card className="rounded-[2rem] border bg-background/90 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Attendance list</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Live check-ins recorded for this event.
                      </p>
                    </div>
                    <Badge className="rounded-full bg-violet-100 px-3 py-1 text-[11px] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                      {checkedInCount} total
                    </Badge>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-[1.5rem] border bg-background">
                    {attendance.length === 0 ? (
                      <EmptyState
                        icon={<CheckCircle2 className="h-5 w-5" />}
                        title="No attendance yet"
                        description="Attendance will appear here as users scan their QR passes."
                      />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/30 text-left">
                              <th className="p-4 text-sm font-semibold">Name</th>
                              <th className="p-4 text-sm font-semibold">Email</th>
                              <th className="p-4 text-sm font-semibold">Checked In At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendance.map((record) => (
                              <tr key={record.id} className="border-b last:border-0">
                                <td className="p-4 font-medium">{record.user_name}</td>
                                <td className="p-4 text-sm text-muted-foreground">{record.user_email}</td>
                                <td className="p-4 text-sm text-muted-foreground">
                                  {formatDate(record.recorded_at)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
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

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-3xl border bg-background/80 shadow-sm backdrop-blur-sm">
      <CardContent className="flex h-full items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 line-clamp-1 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="rounded-2xl bg-violet-100 p-3 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
