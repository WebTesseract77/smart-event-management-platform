"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

import { getCurrentUser, getEvents, getMyRegistrations } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BlurText from "@/components/app/BlurText";

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  LayoutGrid,
  LineChart,
  MapPin,
  Clock,
  QrCode,
  Ticket,
  Users,
  Zap,
  TrendingUp,
} from "lucide-react";

function PreviewCard({
  children,
  className = "",
  delay = 0,
  rotate = 0,
  floatDistance = 6,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  rotate?: number;
  floatDistance?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="will-change-transform"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={
        reduceMotion
          ? undefined
          : {
              opacity: 1,
              y: [0, -floatDistance, 0],
              rotate,
            }
      }
      transition={
        reduceMotion
          ? undefined
          : {
              opacity: { duration: 0.35, delay },
              y: {
                duration: 5 + delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
              rotate: {
                duration: 5 + delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            }
      }
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -4,
              rotate: rotate > 0 ? rotate + 1 : rotate - 1,
              scale: 1.01,
            }
      }
    >
      <Card
        className={`rounded-3xl border bg-background/85 shadow-xl shadow-violet-500/10 backdrop-blur-sm transition-shadow duration-300 hover:shadow-2xl hover:shadow-violet-500/15 ${className}`}
      >
        <CardContent className="p-5">{children}</CardContent>
      </Card>
    </motion.div>
  );
}

function AnimatedStat({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.6, once: true });
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    if (reduceMotion) {
      motionValue.set(value);
      setDisplayValue(value);
      return;
    }

    const unsubscribe = motionValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });

    const controls = animate(motionValue, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1] as const,
    });

    return () => {
      unsubscribe();
      controls.stop();
    };
  }, [inView, motionValue, reduceMotion, value]);

  return (
    <motion.span ref={ref} className="tabular-nums" aria-label={`${value}${suffix}`}>
      {displayValue}
      {suffix}
    </motion.span>
  );
}

const sectionReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
      staggerChildren: 0.08,
    },
  },
};

const itemReveal = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const glowVariants = {
  animate: {
    opacity: [0.4, 0.7, 0.4],
    scale: [1, 1.05, 1],
    transition: {
      duration: 10,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut" as const,
    },
  },
};

const cardHover = {
  y: -4,
  rotate: -1,
  scale: 1.01,
};

export default function HomePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [activePasses, setActivePasses] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token");

      try {
        const events = await getEvents();
        setEventCount(Array.isArray(events) ? events.length : 0);

        if (!token) return;

        const [user, registrations] = await Promise.all([
          getCurrentUser(token),
          getMyRegistrations(token),
        ]);

        setIsAdmin(user.role === "admin");
        setRegistrationCount(Array.isArray(registrations) ? registrations.length : 0);
        setActivePasses(
          Array.isArray(registrations)
            ? registrations.filter(
                (registration: any) =>
                  new Date(registration.event.end_date) >= new Date()
              ).length
            : 0
        );
        setAttendanceRate(
          Array.isArray(registrations) && registrations.length
            ? Math.round(
                (registrations.filter(
                  (registration: any) =>
                    new Date(registration.event.end_date) >= new Date()
                ).length /
                  registrations.length) *
                  100
              )
            : 0
        );
      } catch {}
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_80%_24%,rgba(59,130,246,0.10),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.08),transparent_26%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_80%_24%,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.10),transparent_26%)]" />
        <motion.div
          className="absolute -left-24 top-12 -z-10 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/15"
          aria-hidden="true"
          animate={reduceMotion ? undefined : glowVariants.animate}
        />
        <motion.div
          className="absolute -right-24 top-28 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/15"
          aria-hidden="true"
          animate={reduceMotion ? undefined : glowVariants.animate}
        />

        <motion.div
          className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:py-18"
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
          variants={sectionReveal}
        >
          {/* Left */}
          <motion.div className="max-w-xl" variants={itemReveal}>
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur"
              variants={itemReveal}
            >
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              <BlurText
                text="EventSphere for modern event operations"
                animateBy="words"
                direction="top"
                delay={120}
                stepDuration={0.45}
                className="text-sm font-medium"
              />
            </motion.div>

            <motion.h1
              className="mt-6 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
              variants={itemReveal}
            >
              <BlurText
                text="Manage Events."
                animateBy="words"
                direction="top"
                delay={120}
                stepDuration={0.45}
                className="block"
              />
              <BlurText
                text="Like a"
                animateBy="words"
                direction="top"
                delay={360}
                stepDuration={0.45}
                className="block"
                textClassName="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent"
              />
              <BlurText
                text="Professional."
                animateBy="words"
                direction="top"
                delay={510}
                stepDuration={0.45}
                className="block"
                textClassName="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent"
              />
            </motion.h1>

            <motion.p
              className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground sm:text-xl"
              variants={itemReveal}
            >
              <BlurText
                text="Organize events, handle registrations, issue QR passes, and track attendance from a clean, modern EventSphere workspace built for organizers and attendees."
                animateBy="words"
                direction="top"
                delay={420}
                stepDuration={0.45}
                as="span"
                className="block"
              />
            </motion.p>

            <motion.div className="mt-10 flex flex-col gap-4 sm:flex-row" variants={itemReveal}>
              <Link href="/events">
                <Button
                  size="lg"
                  className="h-12 px-6 text-base shadow-lg shadow-violet-500/15 transition-all duration-300 motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-violet-500/25 active:scale-[0.97]"
                >
                  Browse Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              {isAdmin && (
                <Link href="/create-event">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-6 text-base transition-all duration-300 motion-reduce:transition-none hover:-translate-y-0.5 active:scale-[0.97]"
                  >
                    Create Event
                  </Button>
                </Link>
              )}
            </motion.div>

            <motion.div className="mt-10 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-4" variants={itemReveal}>
              <div className="rounded-2xl border bg-background/80 p-4 backdrop-blur-sm transition-transform duration-300 motion-reduce:transition-none hover:-translate-y-1">
                <Ticket className="h-5 w-5 text-violet-600" />
                <p className="mt-3 text-sm font-medium">QR Passes</p>
              </div>
              <div className="rounded-2xl border bg-background/80 p-4 backdrop-blur-sm transition-transform duration-300 motion-reduce:transition-none hover:-translate-y-1">
                <CheckCircle2 className="h-5 w-5 text-violet-600" />
                <p className="mt-3 text-sm font-medium">Attendance</p>
              </div>
              <div className="rounded-2xl border bg-background/80 p-4 backdrop-blur-sm transition-transform duration-300 motion-reduce:transition-none hover:-translate-y-1">
                <Users className="h-5 w-5 text-violet-600" />
                <p className="mt-3 text-sm font-medium">Teams</p>
              </div>
              <div className="rounded-2xl border bg-background/80 p-4 backdrop-blur-sm transition-transform duration-300 motion-reduce:transition-none hover:-translate-y-1">
                <Zap className="h-5 w-5 text-violet-600" />
                <p className="mt-3 text-sm font-medium">Fast Setup</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right */}
          <motion.div
            className="relative mx-auto w-full max-w-[700px]"
            variants={itemReveal}
          >
            <motion.div
              className="absolute -left-6 top-10 h-24 w-24 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/20"
              aria-hidden="true"
              animate={reduceMotion ? undefined : { opacity: [0.45, 0.7, 0.45], scale: [1, 1.08, 1] }}
              transition={reduceMotion ? undefined : { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute right-0 top-24 h-28 w-28 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/20"
              aria-hidden="true"
              animate={reduceMotion ? undefined : { opacity: [0.45, 0.68, 0.45], scale: [1, 1.06, 1] }}
              transition={reduceMotion ? undefined : { duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />

            <div className="grid gap-4 rounded-[2rem] border bg-background/75 p-4 shadow-2xl shadow-violet-500/10 backdrop-blur-md sm:p-5 lg:grid-cols-2">
              <div className="grid gap-4">
                <PreviewCard className="translate-y-1" delay={0.05} rotate={-1} floatDistance={5}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Analytics</p>
                      <h3 className="mt-2 text-xl font-bold tracking-tight">Event Health</h3>
                    </div>
                    <motion.div
                      className="rounded-xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
                      whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: 6 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TrendingUp className="h-5 w-5" />
                    </motion.div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-2xl border bg-muted/30 px-4 py-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Attendance Rate</p>
                        <p className="mt-1 text-lg font-bold">96%</p>
                      </div>
                      <p className="text-xs font-medium text-emerald-600">+8% this week</p>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border bg-muted/30 px-4 py-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Registrations</p>
                        <p className="mt-1 text-lg font-bold">1.2k</p>
                      </div>
                      <p className="text-xs font-medium text-violet-600">Live</p>
                    </div>
                  </div>
                </PreviewCard>

                <PreviewCard className="sm:translate-y-4" delay={0.15} rotate={1} floatDistance={6}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Event Card</p>
                      <h3 className="mt-2 text-xl font-bold tracking-tight">Hackathon Night</h3>
                    </div>
                    <motion.div
                      className="rounded-xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
                      whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: -6 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Calendar className="h-5 w-5" />
                    </motion.div>
                  </div>

                  <div className="mt-5 space-y-3 rounded-2xl border bg-background/80 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-violet-600" />
                      <span>Main Auditorium</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-violet-600" />
                      <span>Registration closes in 2 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Registered</span>
                      <span className="text-sm text-muted-foreground">138 / 200</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 w-[69%] rounded-full bg-gradient-to-r from-blue-600 to-violet-600" />
                    </div>
                  </div>
                </PreviewCard>
              </div>

              <div className="grid gap-4">
                <PreviewCard className="sm:translate-y-3" delay={0.1} rotate={-1} floatDistance={5}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">QR Pass</p>
                      <h3 className="mt-2 text-xl font-bold tracking-tight">Pass #2048</h3>
                    </div>
                    <motion.div
                      className="rounded-xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
                      whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: 8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <QrCode className="h-5 w-5" />
                    </motion.div>
                  </div>

                  <div className="mt-5 rounded-3xl border bg-muted/30 p-4">
                    <div className="grid grid-cols-[1fr_auto] gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Attendee</p>
                        <p className="mt-1 font-semibold">Aarav Sharma</p>
                        <p className="mt-4 text-xs text-muted-foreground">Status</p>
                        <p className="mt-1 font-semibold text-emerald-600">Verified</p>
                      </div>
                      <div className="grid place-items-center rounded-2xl bg-background p-4 shadow-sm">
                        <div className="grid grid-cols-5 gap-1">
                          {Array.from({ length: 25 }).map((_, i) => (
                            <span
                              key={i}
                              className={`h-2 w-2 rounded-[3px] ${i % 2 === 0 ? "bg-violet-600" : "bg-slate-200 dark:bg-slate-700"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </PreviewCard>

                <PreviewCard className="sm:translate-y-8" delay={0.2} rotate={1} floatDistance={7}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Attendance</p>
                      <h3 className="mt-2 text-xl font-bold tracking-tight">Live Check-ins</h3>
                    </div>
                    <motion.div
                      className="rounded-xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
                      whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Users className="h-5 w-5" />
                    </motion.div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-2xl border bg-background/80 px-4 py-3">
                      <span className="text-sm font-medium">Design Summit</span>
                      <span className="text-sm text-muted-foreground">92 checked in</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border bg-background/80 px-4 py-3">
                      <span className="text-sm font-medium">CodeFest</span>
                      <span className="text-sm text-muted-foreground">138 checked in</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border bg-background/80 px-4 py-3">
                      <span className="text-sm font-medium">Startup Meetup</span>
                      <span className="text-sm text-muted-foreground">61 checked in</span>
                    </div>
                  </div>
                </PreviewCard>

                <div className="grid gap-4 sm:grid-cols-2">
                  <PreviewCard className="translate-y-2" delay={0.08} rotate={-1} floatDistance={4}>
                    <p className="text-xs text-muted-foreground">Upcoming Events</p>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight">24</p>
                  </PreviewCard>

                  <PreviewCard className="translate-y-6" delay={0.14} rotate={1} floatDistance={5}>
                    <p className="text-xs text-muted-foreground">Active Passes</p>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight">684</p>
                  </PreviewCard>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <motion.section
        className="mx-auto max-w-7xl px-6 pt-6"
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{ amount: 0.35, once: true }}
        variants={sectionReveal}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <motion.div variants={itemReveal}>
            <motion.div
              whileHover={reduceMotion ? undefined : { y: -4, rotate: -1, scale: 1.01 }}
              transition={{ duration: 0.28 }}
              className="rounded-3xl"
            >
              <Card className="rounded-3xl border bg-background shadow-sm transition-all duration-300 hover:shadow-lg motion-reduce:transition-none">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Events Hosted</p>
                  <p className="mt-3 text-3xl font-extrabold tracking-tight">
                    <AnimatedStat value={eventCount} />
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">All published events</p>
                </div>
                <div className="rounded-2xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div variants={itemReveal}>
            <motion.div
              whileHover={reduceMotion ? undefined : { y: -4, rotate: 1, scale: 1.01 }}
              transition={{ duration: 0.28 }}
              className="rounded-3xl"
            >
              <Card className="rounded-3xl border bg-background shadow-sm transition-all duration-300 hover:shadow-lg motion-reduce:transition-none">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Registrations</p>
                  <p className="mt-3 text-3xl font-extrabold tracking-tight">
                    <AnimatedStat value={registrationCount} />
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">My active registrations</p>
                </div>
                <div className="rounded-2xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div variants={itemReveal}>
            <motion.div
              whileHover={reduceMotion ? undefined : { y: -4, rotate: -1, scale: 1.01 }}
              transition={{ duration: 0.28 }}
              className="rounded-3xl"
            >
              <Card className="rounded-3xl border bg-background shadow-sm transition-all duration-300 hover:shadow-lg motion-reduce:transition-none">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Active Passes</p>
                  <p className="mt-3 text-3xl font-extrabold tracking-tight">
                    <AnimatedStat value={activePasses} />
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">Valid event passes</p>
                </div>
                <div className="rounded-2xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                  <QrCode className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div variants={itemReveal}>
            <motion.div
              whileHover={reduceMotion ? undefined : { y: -4, rotate: 1, scale: 1.01 }}
              transition={{ duration: 0.28 }}
              className="rounded-3xl"
            >
              <Card className="rounded-3xl border bg-background shadow-sm transition-all duration-300 hover:shadow-lg motion-reduce:transition-none">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  <p className="mt-3 text-3xl font-extrabold tracking-tight">
                    <AnimatedStat value={attendanceRate} suffix="%" />
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">Based on active passes</p>
                </div>
                <div className="rounded-2xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section
        className="mx-auto max-w-7xl px-6 py-20"
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{ amount: 0.2, once: true }}
        variants={sectionReveal}
      >
        <motion.div className="mb-8 max-w-2xl" variants={itemReveal}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to run events smoothly
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Premium tools for passes, attendance, registrations, teams, payments, and insights.
          </p>
        </motion.div>

        <motion.div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" variants={sectionReveal}>
          {[
            {
              icon: <Ticket className="h-5 w-5" />,
              title: "QR Digital Passes",
              description: "Generate secure QR passes instantly for every registration and team member.",
            },
            {
              icon: <CheckCircle2 className="h-5 w-5" />,
              title: "Attendance Tracking",
              description: "Scan QR codes for instant attendance and a cleaner check-in workflow.",
            },
            {
              icon: <Users className="h-5 w-5" />,
              title: "Participant Management",
              description: "Manage attendees and registrations easily from one organized dashboard.",
            },
            {
              icon: <LayoutGrid className="h-5 w-5" />,
              title: "Team Events",
              description: "Built-in support for team registrations with flexible event configurations.",
            },
            {
              icon: <Zap className="h-5 w-5" />,
              title: "Online Payments",
              description: "Secure Razorpay payment integration for paid events and registrations.",
            },
            {
              icon: <LineChart className="h-5 w-5" />,
              title: "Analytics",
              description: "Monitor registrations and attendance with a simple high-level overview.",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemReveal}
              transition={{ duration: 0.45, delay: index * 0.06 }}
            >
              <Link href="/events" className="block" aria-label={feature.title}>
                <Card
                  className="group cursor-pointer rounded-3xl border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10 hover:border-violet-200 motion-reduce:transition-none dark:hover:border-violet-500/30"
                >
                <motion.div
                  whileHover={reduceMotion ? undefined : cardHover}
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  transition={{ duration: 0.28 }}
                  className="rounded-3xl"
                >
                <CardContent className="p-6">
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <motion.div
                        className="rounded-2xl bg-violet-100 p-3 text-violet-600 transition-transform duration-300 dark:bg-violet-500/15 dark:text-violet-300"
                        whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: 8 }}
                        transition={{ duration: 0.28 }}
                      >
                        {feature.icon}
                      </motion.div>
                      <motion.div
                        className="mt-1 text-muted-foreground"
                        animate={reduceMotion ? undefined : { x: [0, 2, 0] }}
                        transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      >
                        <ChevronRight className="h-4 w-4 transition-transform duration-300" />
                      </motion.div>
                    </div>

                    <h3 className="mt-5 text-xl font-semibold tracking-tight">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {feature.description}
                    </p>

                    <motion.div
                      className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-violet-600"
                      animate={reduceMotion ? undefined : { x: [0, 2, 0] }}
                      transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    >
                      <ChevronRight className="h-4 w-4 opacity-0" />
                    </motion.div>
                  </div>
                </CardContent>
                </motion.div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <h3 className="text-xl font-bold">EventSphere</h3>
          <p className="text-sm text-muted-foreground mt-2">Create. Manage. Attend.</p>
          <p className="text-sm text-muted-foreground mt-4">© 2026 EventSphere</p>
        </div>
      </footer>
    </div>
  );
}
