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
      className="will-change-transform h-full"
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
        className={`rounded-[24px] border border-[#E8E1D5] bg-[#FFFFFF] shadow-[0_16px_40px_rgba(24,48,40,0.06)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-2xl ${className}`}
      >
        <CardContent className="p-4 sm:p-5">{children}</CardContent>
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
    <motion.span ref={ref} className="tabular-nums text-[#183028]" aria-label={`${value}${suffix}`}>
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
    <div className="min-h-screen bg-[#FAF8F4] overflow-x-hidden">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#FAF8F4]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_30%,rgba(15,77,63,0.07),transparent_50%)]" />
        <motion.div
          className="absolute -left-24 top-12 -z-10 h-80 w-80 rounded-full bg-[#0F4D3F]/5 blur-3xl"
          aria-hidden="true"
          animate={reduceMotion ? undefined : glowVariants.animate}
        />
        <motion.div
          className="absolute -right-24 top-28 -z-10 h-96 w-96 rounded-full bg-[#C6922F]/5 blur-3xl"
          aria-hidden="true"
          animate={reduceMotion ? undefined : glowVariants.animate}
        />

        <motion.div
          className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl items-center gap-12 px-4 sm:px-6 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:py-16"
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
          variants={sectionReveal}
        >
          {/* Left */}
          <motion.div className="max-w-xl mx-auto lg:mx-0 w-full" variants={itemReveal}>
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-[#E8E1D5] bg-[#F7FAF6] px-4 py-2 text-xs sm:text-sm font-medium shadow-sm backdrop-blur"
              variants={itemReveal}
            >
              <span className="h-2 w-2 rounded-full bg-[#0F4D3F]" />
              <BlurText
                text="EventSphere for modern event operations"
                animateBy="words"
                direction="top"
                delay={120}
                stepDuration={0.45}
                className="text-xs sm:text-sm font-semibold text-[#0F4D3F]"
              />
            </motion.div>

            {/* 🌟 RESPONSIVE HERO SIZES & LINE-HEIGHTS */}
            <motion.h1
              className="mt-6 font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.1] sm:leading-[1.0] lg:leading-[0.85] tracking-[-0.04em] lg:tracking-[-0.07em] text-[#183028]"
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
                className="block text-[#183028]"
              />
              <BlurText
                text="Professional."
                animateBy="words"
                direction="top"
                delay={510}
                stepDuration={0.45}
                className="block text-[#183028]"
              />
            </motion.h1>

            <motion.p
              className="mt-6 max-w-lg text-base sm:text-lg lg:text-xl leading-relaxed sm:leading-8 text-[#5E665F]"
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

            <motion.div className="mt-8 flex flex-col sm:flex-row gap-4" variants={itemReveal}>
              <Link href="/events" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full sm:w-auto px-6 text-base rounded-full bg-[#0F4D3F] text-white shadow-md shadow-[#0F4D3F]/10 transition-all duration-300 motion-reduce:transition-none hover:-translate-y-0.5 hover:bg-[#0B3E33] active:scale-[0.97]"
                >
                  Browse Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Micro Feature Grid - Upgraded Mobile Layout */}
            <motion.div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4" variants={itemReveal}>
              {[
                { icon: <Ticket className="h-5 w-5 text-[#0F4D3F]" />, label: "QR Passes" },
                { icon: <CheckCircle2 className="h-5 w-5 text-[#0F4D3F]" />, label: "Attendance" },
                { icon: <Users className="h-5 w-5 text-[#0F4D3F]" />, label: "Teams" },
                { icon: <Zap className="h-5 w-5 text-[#0F4D3F]" />, label: "Fast Setup" },
              ].map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-[#E8E1D5] bg-[#FFFFFF] p-3 sm:p-4 shadow-sm transition-transform duration-300 motion-reduce:transition-none hover:-translate-y-1">
                  {item.icon}
                  <p className="mt-2 text-xs sm:text-sm font-semibold text-[#183028]">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Section Interactive Mockup Interface */}
          <motion.div
            className="relative mx-auto w-full max-w-[700px] mt-4 lg:mt-0"
            variants={itemReveal}
          >
            <div className="grid gap-4 rounded-[2rem] border border-[#E8E1D5] bg-[#FFFEFC]/90 p-4 shadow-[0_16px_40px_rgba(24,48,40,0.06)] backdrop-blur-md sm:p-5 sm:grid-cols-2">
              <div className="grid gap-4">
                <PreviewCard className="translate-y-0" delay={0.05} rotate={-0.5} floatDistance={4}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-[#5E665F]">Analytics</p>
                      <h3 className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-[#183028]">Event Health</h3>
                    </div>
                    <motion.div
                      className="rounded-xl bg-[#EAF3ED] p-2.5 text-[#0F4D3F]"
                      whileHover={reduceMotion ? undefined : { scale: 1.05, rotate: 4 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5" />
                    </motion.div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    <div className="flex items-center justify-between rounded-xl border border-[#E8E1D5] bg-[#FAF8F4] p-3">
                      <div>
                        <p className="text-[11px] text-[#5E665F]">Attendance Rate</p>
                        <p className="mt-0.5 text-base font-bold text-[#183028]">96%</p>
                      </div>
                      <p className="text-[10px] font-semibold text-emerald-700">+8%</p>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-[#E8E1D5] bg-[#FAF8F4] p-3">
                      <div>
                        <p className="text-[11px] text-[#5E665F]">Total Registrations</p>
                        <p className="mt-0.5 text-base font-bold text-[#183028]">1.2k</p>
                      </div>
                      <p className="text-[10px] font-semibold text-[#0F4D3F]">Live</p>
                    </div>
                  </div>
                </PreviewCard>

                <PreviewCard className="sm:translate-y-2" delay={0.15} rotate={0.5} floatDistance={5}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-[#5E665F]">Event Card</p>
                      <h3 className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-[#183028]">Hackathon Night</h3>
                    </div>
                    <motion.div
                      className="rounded-xl bg-[#EAF3ED] p-2.5 text-[#0F4D3F]"
                      whileHover={reduceMotion ? undefined : { scale: 1.05, rotate: -4 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Calendar className="h-4 sm:h-5 w-4 sm:w-5" />
                    </motion.div>
                  </div>

                  <div className="mt-4 space-y-2 rounded-xl border border-[#E8E1D5] bg-[#FFFFFF] p-3">
                    <div className="flex items-center gap-2 text-xs text-[#5E665F]">
                      <MapPin className="h-3.5 w-3.5 text-[#0F4D3F]" />
                      <span className="truncate">Main Auditorium</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#5E665F]">
                      <Clock className="h-3.5 w-3.5 text-[#0F4D3F]" />
                      <span className="truncate">Closes in 2 days</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="font-semibold text-[#183028]">Registered</span>
                      <span className="text-[#5E665F]">138 / 200</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#FAF8F4] border border-[#E8E1D5] overflow-hidden">
                      <div className="h-full w-[69%] bg-[#0F4D3F]" />
                    </div>
                  </div>
                </PreviewCard>
              </div>

              <div className="grid gap-4">
                <PreviewCard className="sm:translate-y-1" delay={0.1} rotate={-0.5} floatDistance={4}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-[#5E665F]">QR Pass</p>
                      <h3 className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-[#183028]">Pass #2048</h3>
                    </div>
                    <motion.div
                      className="rounded-xl bg-[#EAF3ED] p-2.5 text-[#0F4D3F]"
                      whileHover={reduceMotion ? undefined : { scale: 1.05, rotate: 4 }}
                      transition={{ duration: 0.3 }}
                    >
                      <QrCode className="h-4 sm:h-5 w-4 sm:w-5" />
                    </motion.div>
                  </div>

                  <div className="mt-4 rounded-xl border border-[#E8E1D5] bg-[#FAF8F4] p-3">
                    <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                      <div>
                        <p className="text-[10px] text-[#5E665F]">Attendee</p>
                        <p className="font-semibold text-xs sm:text-sm text-[#183028] truncate max-w-[100px]">Aarav S.</p>
                        <p className="mt-2 text-[10px] text-[#5E665F]">Status</p>
                        <p className="font-semibold text-xs text-emerald-700">Verified</p>
                      </div>
                      <div className="grid place-items-center rounded-xl bg-[#FFFFFF] border border-[#E8E1D5] p-2 shadow-sm">
                        <div className="grid grid-cols-5 gap-0.5">
                          {Array.from({ length: 25 }).map((_, i) => (
                            <span
                              key={i}
                              className={`h-1.5 w-1.5 rounded-[1px] ${i % 2 === 0 ? "bg-[#0F4D3F]" : "bg-[#E8E1D5]"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </PreviewCard>

                <PreviewCard className="sm:translate-y-3" delay={0.2} rotate={0.5} floatDistance={5}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-[#5E665F]">Attendance</p>
                      <h3 className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-[#183028]">Live Check-ins</h3>
                    </div>
                    <motion.div
                      className="rounded-xl bg-[#EAF3ED] p-2.5 text-[#0F4D3F]"
                      whileHover={reduceMotion ? undefined : { scale: 1.05, rotate: -4 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Users className="h-4 sm:h-5 w-4 sm:w-5" />
                    </motion.div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {["Design Summit", "CodeFest", "Startup Meetup"].map((evt, id) => (
                      <div key={id} className="flex items-center justify-between rounded-xl border border-[#E8E1D5] bg-[#FFFFFF] px-3 py-2 text-xs">
                        <span className="font-semibold text-[#183028] truncate max-w-[110px]">{evt}</span>
                        <span className="text-[#5E665F] text-[11px] whitespace-nowrap">{50 + id * 40} in</span>
                      </div>
                    ))}
                  </div>
                </PreviewCard>

                <div className="grid grid-cols-2 gap-4">
                  <PreviewCard className="translate-y-0" delay={0.08} rotate={-0.5} floatDistance={3}>
                    <p className="text-[11px] text-[#5E665F] truncate">Upcoming</p>
                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#183028]">24</p>
                  </PreviewCard>

                  <PreviewCard className="translate-y-0" delay={0.14} rotate={0.5} floatDistance={3}>
                    <p className="text-[11px] text-[#5E665F] truncate">Active Passes</p>
                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#183028]">684</p>
                  </PreviewCard>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Dashboard Row */}
      <motion.section
        className="mx-auto max-w-7xl px-4 sm:px-6 pt-4 bg-[#FAF8F4]"
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{ amount: 0.15, once: true }}
        variants={sectionReveal}
      >
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Events Hosted", val: eventCount, sub: "All published events", icon: <Calendar className="h-5 w-5" /> },
            { label: "Registrations", val: registrationCount, sub: "My active registrations", icon: <Users className="h-5 w-5" /> },
            { label: "Active Passes", val: activePasses, sub: "Valid event passes", icon: <QrCode className="h-5 w-5" /> },
            { label: "Attendance Rate", val: attendanceRate, sub: "Based on active passes", suf: "%", icon: <TrendingUp className="h-5 w-5" /> },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemReveal}>
              <motion.div
                whileHover={reduceMotion ? undefined : { y: -3, rotate: i % 2 === 0 ? -0.5 : 0.5, scale: 1.005 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl"
              >
                <Card className="rounded-[22px] border border-[#E8E1D5] bg-[#FFFFFF] shadow-[0_16px_40px_rgba(24,48,40,0.06)] hover:shadow-md transition-shadow">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-[#5E665F]">{stat.label}</p>
                        <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#183028]">
                          <AnimatedStat value={stat.val} suffix={stat.suf} />
                        </p>
                        <p className="mt-1.5 text-xs sm:text-sm text-[#5E665F]">{stat.sub}</p>
                      </div>
                      <div className="rounded-xl bg-[#EAF3ED] p-2.5 sm:p-3 text-[#0F4D3F]">
                        {stat.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features Grid Layout */}
      <motion.section
        className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 bg-[#FAF8F4]"
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{ amount: 0.1, once: true }}
        variants={sectionReveal}
      >
        <motion.div className="mb-10 max-w-2xl text-left" variants={itemReveal}>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#C6922F]">
            Features
          </p>
          <h2 className="mt-2.5 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#183028]">
            Everything you need to run events smoothly
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#5E665F]">
            Premium tools for passes, attendance, registrations, teams, payments, and insights.
          </p>
        </motion.div>

        <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={sectionReveal}>
          {[
            { icon: <Ticket className="h-5 w-5" />, title: "QR Digital Passes", description: "Generate secure QR passes instantly for every registration and team member." },
            { icon: <CheckCircle2 className="h-5 w-5" />, title: "Attendance Tracking", description: "Scan QR codes for instant attendance and a cleaner check-in workflow." },
            { icon: <Users className="h-5 w-5" />, title: "Participant Management", description: "Manage attendees and registrations easily from one organized dashboard." },
            { icon: <LayoutGrid className="h-5 w-5" />, title: "Team Events", description: "Built-in support for team registrations with flexible event configurations." },
            { icon: <Zap className="h-5 w-5" />, title: "Online Payments", description: "Secure Razorpay payment integration for paid events and registrations." },
            { icon: <LineChart className="h-5 w-5" />, title: "Analytics", description: "Monitor registrations and attendance with a simple high-level overview." },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemReveal}
              transition={{ duration: 0.45, delay: index * 0.05 }}
            >
              <Link href="/events" className="block" aria-label={feature.title}>
                <Card className="group h-full cursor-pointer rounded-[24px] border border-[#E8E1D5] bg-[#FFFFFF] shadow-[0_16px_40px_rgba(24,48,40,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#0F4D3F]/30">
                  <motion.div
                    whileHover={reduceMotion ? undefined : cardHover}
                    whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-[24px] h-full"
                  >
                    <CardContent className="p-5 sm:p-6 flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="rounded-xl bg-[#EAF3ED] p-2.5 text-[#0F4D3F]">
                            {feature.icon}
                          </div>
                          <ChevronRight className="h-4 w-4 text-[#5E665F] transform group-hover:translate-x-1 transition-transform" />
                        </div>
                        <h3 className="mt-4 text-lg sm:text-xl font-semibold tracking-tight text-[#183028]">
                          {feature.title}
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm leading-relaxed sm:leading-6 text-[#5E665F]">
                          {feature.description}
                        </p>
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
      <footer className="border-t border-[#E8E1D5] bg-[#0F4D3F] text-white">
        <div className="max-w-6xl mx-auto px-6 py-10 text-center">
          <h3 className="text-xl font-bold">
            <span className="text-white">Event</span>
            <span className="text-[#C6922F]">Sphere</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#FAF8F4]/80 mt-2">Events. Seamless. Everywhere.</p>
        </div>
      </footer>
    </div>
  );
}