"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  Activity,
  ArrowRight,
  Calendar,
  ChevronRight,
  CreditCard,
  Layers3,
  MapPin,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getCurrentUser, getOrganizerAnalytics } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <Card className="rounded-3xl border bg-background/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10">
      <CardContent className="flex h-full items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="rounded-2xl bg-violet-100 p-3 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: any[];
}) {
  return (
    <Card className="rounded-[2rem] border bg-background/90 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-5">
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="h-72">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                icon={<Activity className="h-5 w-5" />}
                title="No chart data available"
                description="There isn’t enough data yet to draw this chart."
              />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid rgba(148,163,184,0.18)",
                    background: "rgba(255,255,255,0.96)",
                  }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#7c3aed">
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? "#7c3aed" : "#8b5cf6"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EventCard({ item }: { item: any }) {
  return (
    <Card className="overflow-hidden rounded-[2rem] border bg-background/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10">
      <div className="relative aspect-[16/9] bg-gradient-to-br from-violet-500/15 via-blue-500/10 to-transparent">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Layers3 className="h-10 w-10 text-violet-600/60" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          <Badge className="rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[10px] text-white backdrop-blur-md">
            {item.status}
          </Badge>
          <Badge className="rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[10px] text-white backdrop-blur-md">
            {item.is_team_event ? "Team" : "Individual"}
          </Badge>
          <Badge className="rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[10px] text-white backdrop-blur-md">
            {item.is_paid_event ? "Paid" : "Free"}
          </Badge>
        </div>
      </div>
      <CardContent className="p-5">
        <h3 className="truncate text-lg font-semibold tracking-tight">{item.title}</h3>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-violet-600" />
            <span>{formatDate(item.start_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-violet-600" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-violet-600" />
            <span>{item.registered_count} registrations</span>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <Link href={`/organizer/events/${item.id}`}>
            <Button variant="outline" className="rounded-full px-4">
              Quick View
            </Button>
          </Link>
          <span className="text-xs text-muted-foreground">{item.revenue ? `₹${item.revenue}` : "N/A"}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityList({
  title,
  items,
  emptyTitle,
  emptyDescription,
  kind,
}: {
  title: string;
  items: any[];
  emptyTitle: string;
  emptyDescription: string;
  kind: "registration" | "attendance";
}) {
  return (
    <Card className="rounded-[2rem] border bg-background/90 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Most recent organizer activity.</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mt-5">
          {items.length === 0 ? (
            <EmptyState
              icon={<Activity className="h-5 w-5" />}
              title={emptyTitle}
              description={emptyDescription}
            />
          ) : (
            <div className="grid gap-3">
              {items.map((item) => (
                <div
                  key={`${kind}-${item.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border bg-background/80 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {kind === "registration" ? item.event_title : item.event_title}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {kind === "registration"
                        ? `Registered at ${formatDate(item.registered_at)}`
                        : `Checked in at ${formatDate(item.recorded_at)}`}
                    </p>
                  </div>
                  <Badge className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                    {kind === "registration" ? "New registration" : "Attendance"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrganizerAnalyticsPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

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
          router.push(currentUser.role === "admin" ? "/dashboard" : "/events");
          return;
        }

        const data = await getOrganizerAnalytics(currentToken!);
        setAnalytics(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const registrationByEvent = useMemo(
    () =>
      (analytics?.event_summaries || []).map((item: any) => ({
        name: item.title,
        value: item.registered_count,
      })),
    [analytics]
  );

  const revenueByEvent = useMemo(
    () =>
      (analytics?.event_summaries || []).map((item: any) => ({
        name: item.title,
        value: Number(item.revenue || 0),
      })),
    [analytics]
  );

  const attendanceByEvent = useMemo(
    () =>
      (analytics?.event_summaries || []).map((item: any) => ({
        name: item.title,
        value: item.attendance_count,
      })),
    [analytics]
  );

  const upcomingEvents = useMemo(
    () => (analytics?.event_summaries || []).filter((item: any) => item.status === "Upcoming"),
    [analytics]
  );

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
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="h-80 animate-pulse rounded-[2rem] bg-background/80" />
              <div className="h-80 animate-pulse rounded-[2rem] bg-background/80" />
            </div>
          </div>
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
                      Organizer Analytics
                    </p>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                      Organizer Analytics
                    </h1>
                    <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
                      Insights for your events.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link href="/create-event">
                      <Button size="lg" className="rounded-full px-5">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Event
                      </Button>
                    </Link>
                    <Link href="/organizer/events">
                      <Button variant="outline" size="lg" className="rounded-full px-5">
                        My Events
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button variant="outline" size="lg" className="rounded-full px-5">
                        View Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Events"
                value={analytics?.total_events ?? 0}
                subtitle="Owned by the organizer"
                icon={<Calendar className="h-5 w-5" />}
              />
              <StatCard
                title="Total Registrations"
                value={analytics?.total_registrations ?? 0}
                subtitle="Across your events"
                icon={<Users className="h-5 w-5" />}
              />
              <StatCard
                title="Attendance %"
                value={`${analytics?.attendance_rate ?? 0}%`}
                subtitle="Check-ins / registrations"
                icon={<TrendingUp className="h-5 w-5" />}
              />
              <StatCard
                title="Revenue"
                value={`₹${Number(analytics?.total_revenue ?? 0).toLocaleString("en-IN")}`}
                subtitle="Paid events only"
                icon={<CreditCard className="h-5 w-5" />}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <ChartCard
                title="Registrations by Event"
                description="Compare registration volume across your events."
                data={registrationByEvent}
              />
              <ChartCard
                title="Revenue by Event"
                description="See which events generated the most revenue."
                data={revenueByEvent}
              />
              <ChartCard
                title="Attendance by Event"
                description="Track attendance against your registrations."
                data={attendanceByEvent}
              />

              <Card className="rounded-[2rem] border bg-background/90 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">Upcoming Events</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Events you still have coming up.</p>
                    </div>
                    <Badge className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                      {upcomingEvents.length}
                    </Badge>
                  </div>

                  <div className="mt-5 grid gap-4">
                    {upcomingEvents.length === 0 ? (
                      <EmptyState
                        icon={<Calendar className="h-5 w-5" />}
                        title="No upcoming organizer events"
                        description="Your upcoming events will appear here once you create them."
                      />
                    ) : (
                      upcomingEvents.slice(0, 4).map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-4 rounded-[1.5rem] border bg-background/80 p-4"
                        >
                          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/15 via-blue-500/10 to-transparent">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Calendar className="h-6 w-6 text-violet-600/60" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate font-semibold text-foreground">{item.title}</h4>
                            <p className="mt-1 text-sm text-muted-foreground">{formatDate(item.start_date)}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{item.registered_count} registrations</p>
                            <Link href={`/organizer/events/${item.id}`} className="mt-3 inline-flex">
                              <Button variant="outline" size="sm" className="rounded-full px-3">
                                Quick View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <ActivityList
                title="Recent registrations"
                items={analytics?.recent_registrations || []}
                emptyTitle="No recent registrations."
                emptyDescription="Registrations will appear here once attendees start signing up."
                kind="registration"
              />
              <ActivityList
                title="Recent attendance"
                items={analytics?.recent_attendance || []}
                emptyTitle="No recent attendance."
                emptyDescription="Attendance records will appear here after check-ins begin."
                kind="attendance"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
