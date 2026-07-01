"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  Calendar,
  Search,
  Ticket,
  Users,
  CheckCircle2,
  QrCode,
} from "lucide-react";

import {
  getCurrentUser,
  getOrganizerEventAttendance,
  getOrganizerEventParticipants,
  getOrganizerEvents,
} from "@/lib/api";
import { EmptyState, PageHeaderSkeleton } from "@/components/app/FeedbackStates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function getInitials(name?: string) {
  const value = String(name || "U").trim();
  const parts = value.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "U";
  const second = parts[1]?.[0] || parts[0]?.[1] || "";
  return `${first}${second}`.toUpperCase();
}

function countBadgeClass(tone: "violet" | "emerald" | "sky") {
  if (tone === "emerald") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  if (tone === "sky") return "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300";
  return "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300";
}

export default function OrganizerParticipantsPage() {
  const params = useParams();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const eventId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [search, setSearch] = useState("");

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
          setParticipants([]);
          setAttendance([]);
          return;
        }

        setEvent(selectedEvent);

        const [participantsData, attendanceData] = await Promise.all([
          getOrganizerEventParticipants(currentToken!, eventId),
          getOrganizerEventAttendance(currentToken!, eventId),
        ]);

        setParticipants(Array.isArray(participantsData) ? participantsData : []);
        setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load participants");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventId, router]);

  const filteredParticipants = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return participants;

    return participants.filter((participant) => {
      const text = `${participant.name} ${participant.email}`.toLowerCase();
      return text.includes(query);
    });
  }, [participants, search]);

  const checkedInUserIds = useMemo(
    () => new Set(attendance.map((record) => Number(record.user_id))),
    [attendance]
  );

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
            <Card className="rounded-[2rem] border bg-background/85 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-10 w-full rounded-full bg-muted/70" />
                  <div className="h-8 w-56 rounded-full bg-muted/60" />
                  <div className="h-8 w-44 rounded-full bg-muted/60" />
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
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-muted/30 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="Event not found"
            description="This event may no longer exist or you may not have access to it."
            actionLabel="Back to My Events"
            actionHref="/organizer/events"
          />
        </div>
      </div>
    );
  }

  const totalAttendance = attendance.length;

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
                      <Users className="h-3.5 w-3.5" />
                      Organizer Participants
                    </p>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                      {event.title}
                    </h1>
                    <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
                      View registered participants, their QR pass status, and attendance from one
                      clean workspace.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${countBadgeClass("violet")}`}>
                      <Users className="h-4 w-4" />
                      {participants.length} participants
                    </div>
                    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${countBadgeClass("emerald")}`}>
                      <CheckCircle2 className="h-4 w-4" />
                      {totalAttendance} checked in
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
              <StatCard title="Participants" value={participants.length} icon={<Users className="h-5 w-5" />} />
              <StatCard title="Checked In" value={totalAttendance} icon={<CheckCircle2 className="h-5 w-5" />} />
              <StatCard title="QR Passes" value={participants.length} icon={<QrCode className="h-5 w-5" />} />
              <StatCard title="Registration Status" value={participants.length} icon={<Ticket className="h-5 w-5" />} />
            </div>

            <Card className="rounded-[2rem] border bg-background/90 shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Participant list</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Search by name or email. QR, registration, and attendance states are shown at a glance.
                    </p>
                  </div>
                  <div className="relative w-full md:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search participants"
                      className="h-11 w-full rounded-full border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-[1.5rem] border bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-5">Participant</TableHead>
                        <TableHead>QR Status</TableHead>
                        <TableHead>Registration</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead className="pr-5 text-right">Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParticipants.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-12">
                            <EmptyState
                              icon={<Search className="h-5 w-5" />}
                              title="No participants found"
                              description="Try a different search term."
                            />
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredParticipants.map((participant) => {
                          const isCheckedIn = checkedInUserIds.has(Number(participant.id));

                          return (
                            <TableRow key={participant.id} className="hover:bg-muted/40">
                              <TableCell className="pl-5">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                                    {getInitials(participant.name)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-foreground">{participant.name}</p>
                                    <p className="text-xs text-muted-foreground">Participant ID #{participant.id}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                                  QR Pass Ready
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                                  Registered
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`rounded-full px-2.5 py-1 text-[11px] ${
                                    isCheckedIn
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {isCheckedIn ? "Checked In" : "Pending"}
                                </Badge>
                              </TableCell>
                              <TableCell className="pr-5 text-right text-sm text-muted-foreground">
                                {participant.email}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
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
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-3xl border bg-background/80 shadow-sm backdrop-blur-sm">
      <CardContent className="flex h-full items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="rounded-2xl bg-violet-100 p-3 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
