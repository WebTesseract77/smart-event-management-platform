"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  getAnalytics,
  getCurrentUser,
  getEvents,
  getMyRegistrations,
} from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeaderSkeleton } from "@/components/app/FeedbackStates";

import { ArrowRight, Bell } from "lucide-react";

import AdminDashboard from "@/components/dashboard/AdminDashboard";
import OrganizerDashboard from "@/components/dashboard/OrganizerDashboard";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { pageReveal, itemReveal } from "@/components/dashboard/dashboardAnimations";
import type { DashboardRole } from "@/components/dashboard/dashboardTypes";

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
    <div className="min-h-screen bg-[#FAF8F4]">
      <motion.div
        className="mx-auto max-w-[1280px] px-5 py-6 sm:py-8 lg:py-10"
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
        variants={pageReveal}
      >
        {loading ? (
          <div className="space-y-6">
            <PageHeaderSkeleton />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-3xl bg-white/80 shadow-sm" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="space-y-6 rounded-[2rem] border bg-white/80 p-6 shadow-sm">
                <div className="h-5 w-40 rounded-full bg-muted/70" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-20 rounded-2xl bg-muted/60" />
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] border bg-white/80 p-6 shadow-sm">
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
            <motion.section variants={itemReveal} className="mb-7 rounded-[24px] border border-[#E8E1D5] bg-white p-6 shadow-[0_12px_32px_rgba(15,77,63,0.05)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="inline-flex items-center gap-2 rounded-full border border-[#E8E1D5] bg-[#F5F2EA] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#183028] shadow-sm">
                    <Bell className="h-3.5 w-3.5" />
                    {role === "admin" ? "Admin dashboard" : role === "organizer" ? "Organizer dashboard" : "User dashboard"}
                  </p>
               <h1
  className="
    mt-7
    font-serif
    text-[3.2rem]
    leading-[0.92]
    tracking-[-0.05em]
    text-[#183028]
  "
>
  Welcome back, {userName}
</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5E665F]">
                    {role === "admin"
                      ? "Manage events, registrations and attendance from one place."
                      : role === "organizer"
                        ? "Track your events, participants and attendance from one organizer workspace."
                        : "Browse events, registrations and passes from one simple dashboard."}
                  </p>
                </div>

                <div className="rounded-[18px] border border-[#E8E1D5] bg-[#F5F2EA] px-4 py-2 text-sm text-[#5E665F] shadow-sm">
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
              <Card className="rounded-[24px] border border-[#E8E1D5] bg-white shadow-[0_12px_32px_rgba(15,77,63,0.05)]">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl">
<h2 className="font-serif text-[2.2rem] leading-[0.95] tracking-[-0.04em] text-[#183028]">
  Platform Overview
</h2>                     <p className="mt-2 text-sm text-[#5E665F]">
                        Manage events, registrations, QR passes and attendance from a single platform.
                      </p>
                    </div>
                    <Link href="/events">
                      <motion.div whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }} whileTap={reduceMotion ? undefined : { scale: 0.99 }}>
                        <Button className="h-11 rounded-full bg-[#0F4D3F] px-5 text-sm text-white hover:bg-[#0B3E33]">
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