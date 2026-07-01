"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  getAnalytics,
  getCurrentUser,
  getEvents,
  getMyRegistrations,
} from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/app/StatCard";
import { EmptyState, PageHeaderSkeleton } from "@/components/app/FeedbackStates";

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock3,
  QrCode,
  Ticket,
  TrendingUp,
  Users,
  Zap,
  Bell,
  Layers3,
  MapPin,
  Shield,
  Plus,
  BookUser,
  Activity,
} from "lucide-react";

type DashboardRole = "admin" | "organizer" | "user";

type QuickCard = {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

type RegistrationItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  status: string;
  passId?: string | number;
};

type UpcomingItem = {
  id: string;
  title: string;
  date: string;
  location: string;
};

const pageReveal = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
      staggerChildren: 0.07,
    },
  },
};

const itemReveal = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function ActionCard({ href, title, description, icon }: QuickCard) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div variants={itemReveal}>
      <Link href={href} className="block h-full">
        <motion.div
          whileHover={reduceMotion ? undefined : { y: -4, rotate: -1, scale: 1.01 }}
          whileTap={reduceMotion ? undefined : { scale: 0.99 }}
          transition={{ duration: 0.28 }}
          className="h-full rounded-3xl"
        >
          <Card className="group h-full rounded-3xl border bg-background shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10">
            <CardContent className="flex h-full flex-col p-6">
              <motion.div
                className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
                whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: 8 }}
                transition={{ duration: 0.28 }}
              >
                {icon}
              </motion.div>
              <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              <motion.div
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-violet-600"
                animate={reduceMotion ? undefined : { x: [0, 2, 0] }}
                transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <span>Open</span>
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </Link>
    </motion.div>
  );
}

function InfoCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card className="rounded-3xl border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10">
      <CardContent className="flex h-full items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
        </div>
        <div className="rounded-2xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function RegistrationCard({ item }: { item: RegistrationItem }) {
  return (
    <Card className="h-full rounded-3xl border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Registration</p>
            <h3 className="mt-2 truncate text-xl font-semibold tracking-tight">{item.title}</h3>
          </div>
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
            <Ticket className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-violet-600" />
            <span>{item.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-violet-600" />
            <span>{item.location}</span>
          </div>
          <div className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {item.status}
          </div>
        </div>

        {item.passId ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/pass/${item.passId}`}>
              <Button size="sm" variant="outline" className="rounded-full">
                QR Pass
              </Button>
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CompactEventCard({ item }: { item: UpcomingItem }) {
  return (
    <Card className="h-full rounded-3xl border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Event</p>
            <h3 className="mt-2 truncate text-lg font-semibold tracking-tight">{item.title}</h3>
          </div>
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-violet-600" />
            <span>{item.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-violet-600" />
            <span>{item.location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionHeading({ eyebrow, title, icon }: { eyebrow: string; title: string; icon: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="rounded-2xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
        {icon}
      </div>
    </div>
  );
}

function AdminDashboard({
  eventCount,
  registrationCount,
  activePasses,
  analytics,
  events,
  registrations,
}: {
  eventCount: number;
  registrationCount: number;
  activePasses: number;
  analytics: any;
  events: any[];
  registrations: any[];
}) {
  const recentRegistrations = useMemo<RegistrationItem[]>(
    () =>
      registrations.slice(0, 3).map((registration: any, index) => ({
        id: `registration-${registration.id ?? index}`,
        title: registration.event?.title ?? "Registration",
        date: registration.event?.start_date
          ? new Date(registration.event.start_date).toLocaleDateString()
          : "Date unavailable",
        location: registration.event?.location ?? "Location unavailable",
        status: registration.status ?? "Active",
        passId: registration.id,
      })),
    [registrations]
  );

  return (
    <>
      <motion.section variants={itemReveal} className="mb-8" id="analytics">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Events" value={analytics?.total_events ?? eventCount} icon={<Calendar className="h-6 w-6" />} />
          <StatCard title="Total Registrations" value={analytics?.total_registrations ?? registrationCount} icon={<Ticket className="h-6 w-6" />} />
          <StatCard title="Attendance" value={analytics ? `${analytics.attendance_rate}%` : `${activePasses}`} icon={<TrendingUp className="h-6 w-6" />} />
          <StatCard title="Revenue" value={analytics?.revenue ?? "N/A"} icon={<QrCode className="h-6 w-6" />} />
        </div>
      </motion.section>

      <motion.section variants={itemReveal} className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard href="/events" title="Events" description="Review and manage the event list." icon={<Calendar className="h-5 w-5" />} />
        <ActionCard href="/admin/users" title="Users" description="Promote or demote users." icon={<Shield className="h-5 w-5" />} />
        <ActionCard href="/create-event" title="Create Event" description="Launch a new event." icon={<Plus className="h-5 w-5" />} />
        <ActionCard href="/events" title="Analytics" description="Inspect platform performance." icon={<Activity className="h-5 w-5" />} />
      </motion.section>

      <motion.section variants={itemReveal} className="mb-8 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[2rem] border bg-background shadow-sm">
          <CardContent className="p-6">
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
                  title="No events yet"
                  description="Create your first event to get started."
                  actionLabel="Create Event"
                  actionHref="/create-event"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border bg-background shadow-sm">
          <CardContent className="p-6">
            <SectionHeading eyebrow="Recent Activity" title="Registration overview" icon={<Users className="h-5 w-5" />} />
            <div className="space-y-4">
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">Total registrations</p>
                <p className="mt-2 text-3xl font-semibold">{analytics?.total_registrations ?? registrationCount}</p>
              </div>
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">Attendance rate</p>
                <p className="mt-2 text-3xl font-semibold">{analytics ? `${analytics.attendance_rate}%` : "N/A"}</p>
              </div>
              <div className="rounded-2xl border bg-muted/20 p-4">
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

function OrganizerDashboard({
  userId,
  events,
}: {
  userId: number;
  events: any[];
}) {
  const myEvents = events.filter((event) => event.created_by === userId);
  const myEventCount = myEvents.length;
  const myParticipantCount = myEvents.reduce((sum, event) => sum + (event.registered_count || 0), 0);

  return (
    <>
      <motion.section variants={itemReveal} className="mb-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="My Events" value={myEventCount} icon={<Calendar className="h-6 w-6" />} />
          <StatCard title="Participants" value={myParticipantCount} icon={<BookUser className="h-6 w-6" />} />
          <StatCard title="Attendance" value="Open" icon={<CheckCircle2 className="h-6 w-6" />} />
          <StatCard title="Quick Create" value="Ready" icon={<Zap className="h-6 w-6" />} />
        </div>
      </motion.section>

      <motion.section variants={itemReveal} className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard href="/events" title="My Events" description="Review the events you created." icon={<Calendar className="h-5 w-5" />} />
        <ActionCard href="/create-event" title="Create Event" description="Start a new organizer event." icon={<Plus className="h-5 w-5" />} />
        <ActionCard href="/events" title="Participants" description="Open participant lists from events." icon={<BookUser className="h-5 w-5" />} />
        <ActionCard href="/scanner" title="Attendance" description="Scan QR codes for check-ins." icon={<QrCode className="h-5 w-5" />} />
      </motion.section>

      <motion.section variants={itemReveal} className="mb-8 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[2rem] border bg-background shadow-sm">
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

        <Card className="rounded-[2rem] border bg-background shadow-sm">
          <CardContent className="p-6">
            <SectionHeading eyebrow="Quick Actions" title="Get things done" icon={<Zap className="h-5 w-5" />} />
            <div className="space-y-4">
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">My events</p>
                <p className="mt-2 text-3xl font-semibold">{myEventCount}</p>
              </div>
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">Total participants</p>
                <p className="mt-2 text-3xl font-semibold">{myParticipantCount}</p>
              </div>
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="mt-2 text-lg font-semibold">Use the scanner for live check-ins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </>
  );
}

function UserDashboard({
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Registered Events" value={registrationCount} icon={<Ticket className="h-6 w-6" />} />
          <StatCard title="Upcoming Events" value={upcomingCount} icon={<Calendar className="h-6 w-6" />} />
          <StatCard title="Active QR Passes" value={activePasses} icon={<QrCode className="h-6 w-6" />} />
          <StatCard title="Events Available" value={eventCount} icon={<TrendingUp className="h-6 w-6" />} />
        </div>
      </motion.section>

      <motion.section variants={itemReveal} className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard href="/events" title="Browse Events" description="Discover upcoming events." icon={<Calendar className="h-5 w-5" />} />
        <ActionCard href="/my-registrations" title="My Registrations" description="View your event passes." icon={<Ticket className="h-5 w-5" />} />
        <ActionCard href="/profile" title="Profile" description="Manage your account." icon={<Users className="h-5 w-5" />} />
        <ActionCard href="/events" title="Digital Passes" description="Open the passes you saved." icon={<QrCode className="h-5 w-5" />} />
      </motion.section>

      <motion.section variants={itemReveal} className="mb-8 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {recentRegistrations[0] ? (
            <RegistrationCard item={recentRegistrations[0]} />
          ) : (
            <EmptyState
              icon={<Ticket className="h-5 w-5" />}
              title="No registrations yet"
              description="Browse events to get started."
              actionLabel="Browse Events"
              actionHref="/events"
            />
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {recentRegistrations[1] ? (
              <RegistrationCard item={recentRegistrations[1]} />
            ) : (
              <EmptyState
                icon={<Ticket className="h-5 w-5" />}
                title="No registrations yet"
                description="Browse events to get started."
                actionLabel="Browse Events"
                actionHref="/events"
              />
            )}
            {recentRegistrations[2] ? (
              <RegistrationCard item={recentRegistrations[2]} />
            ) : (
              <EmptyState
                icon={<Ticket className="h-5 w-5" />}
                title="No registrations yet"
                description="Browse events to get started."
                actionLabel="Browse Events"
                actionHref="/events"
              />
            )}
          </div>
        </div>

        <Card className="rounded-[2rem] border bg-background shadow-sm">
          <CardContent className="p-6">
            <SectionHeading eyebrow="Upcoming Events" title="Plan ahead" icon={<Layers3 className="h-5 w-5" />} />
            <div className="space-y-4">
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

export default function Dashboard() {
  const [eventCount, setEventCount] = useState(0);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [activePasses, setActivePasses] = useState(0);
  const [analytics, setAnalytics] = useState<any>(null);
  const [role, setRole] = useState<DashboardRole>("user");
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [userName, setUserName] = useState("there");
  const [userId, setUserId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    async function loadData() {
      try {
        const eventsData = await getEvents();
        const safeEvents = Array.isArray(eventsData) ? eventsData : [];
        setEvents(safeEvents);
        setEventCount(safeEvents.length);

        const now = new Date();
        setUpcomingCount(safeEvents.filter((event: any) => new Date(event.start_date) > now).length);

        const token = localStorage.getItem("token");
        if (!token) return;

        const currentUser = await getCurrentUser(token);
        const currentRole = currentUser.role === "admin" || currentUser.role === "organizer" ? currentUser.role : "user";
        setRole(currentRole);
        setUserName(currentUser.name || "there");
        setUserId(Number(currentUser.id || 0));

        const registrationsData = await getMyRegistrations(token);
        const safeRegistrations = Array.isArray(registrationsData) ? registrationsData : [];
        setRegistrations(safeRegistrations);
        setRegistrationCount(safeRegistrations.length);
        setActivePasses(safeRegistrations.filter((registration: any) => new Date(registration.event.end_date) >= new Date()).length);

        if (currentRole === "admin") {
          const analyticsData = await getAnalytics(token);
          setAnalytics(analyticsData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <motion.div
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
        variants={pageReveal}
      >
        {loading ? (
          <div className="space-y-6">
            <PageHeaderSkeleton />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-3xl bg-background/80 shadow-sm" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="space-y-6 rounded-[2rem] border bg-background/80 p-6 shadow-sm">
                <div className="h-5 w-40 rounded-full bg-muted/70" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-20 rounded-2xl bg-muted/60" />
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] border bg-background/80 p-6 shadow-sm">
                <div className="h-5 w-36 rounded-full bg-muted/70" />
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-16 rounded-2xl bg-muted/60" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <motion.section variants={itemReveal} className="mb-8 rounded-[2rem] border bg-background/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="inline-flex items-center gap-2 rounded-full border bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">
                    <Bell className="h-3.5 w-3.5" />
                    {role === "admin" ? "Admin dashboard" : role === "organizer" ? "Organizer dashboard" : "User dashboard"}
                  </p>
                  <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    Welcome back, {userName}
                  </h1>
                  <p className="mt-3 text-lg text-muted-foreground">
                    {role === "admin"
                      ? "Manage events, registrations and attendance from one place."
                      : role === "organizer"
                        ? "Track your events, participants and attendance from one organizer workspace."
                        : "Browse events, registrations and passes from one simple dashboard."}
                  </p>
                </div>

                <div className="rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  {new Date().toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </motion.section>

            {role === "admin" ? (
              <AdminDashboard eventCount={eventCount} registrationCount={registrationCount} activePasses={activePasses} analytics={analytics} events={events} registrations={registrations} />
            ) : role === "organizer" ? (
              <OrganizerDashboard userId={userId} events={events} />
            ) : (
              <UserDashboard eventCount={eventCount} registrationCount={registrationCount} upcomingCount={upcomingCount} activePasses={activePasses} registrations={registrations} events={events} />
            )}

            <motion.section variants={itemReveal} className="mt-8">
              <Card className="rounded-[2rem] border bg-background shadow-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl">
                      <h2 className="text-2xl font-bold tracking-tight">Platform Overview</h2>
                      <p className="mt-3 text-muted-foreground">
                        Manage events, registrations, QR passes and attendance from a single platform.
                      </p>
                    </div>
                    <Link href="/events">
                      <motion.div whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }} whileTap={reduceMotion ? undefined : { scale: 0.99 }}>
                        <Button className="h-12 rounded-full px-5">
                          Explore Events
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </>
        )}
      </motion.div>
    </div>
  );
}
