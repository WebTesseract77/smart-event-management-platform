"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMyRegistrations, unregisterFromEvent } from "@/lib/api";
import { Calendar } from "lucide-react";
import {
  RegistrationCard,
  RegistrationSkeleton,
} from "@/components/app/MyRegistrationsShared";

function Header({ count, active }: { count: number; active: number }) {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-background/90 px-5 py-4 shadow-sm shadow-slate-900/5 backdrop-blur-sm dark:border-white/10 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">My registrations</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Individual Registrations
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
            View your individual event registrations and digital passes.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[300px]">
          <div className="rounded-2xl border border-violet-200/80 bg-violet-50 px-4 py-3 shadow-sm dark:border-violet-500/20 dark:bg-violet-500/10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">Total registrations</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{count}</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-background/80 px-4 py-3 shadow-sm dark:border-white/10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">Active passes</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{active}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IndividualRegistrationsPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const activePasses = registrations.filter((registration) => registration.event?.end_date && new Date(registration.event.end_date) >= new Date()).length;

  async function handleUnregister(eventId: number) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await unregisterFromEvent(token, eventId);
      setRegistrations(registrations.filter((registration) => registration.event_id !== eventId));
      toast.success("Registration cancelled");
    } catch (error) {
      console.error(error);
      toast.error("Failed to unregister");
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        const data = await getMyRegistrations(token!);
        setRegistrations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.1),transparent_30%)]" />
        <div className="mx-auto max-w-7xl px-6 py-8 lg:py-10">
          {loading ? (
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-white/70 bg-background/90 p-6 shadow-sm shadow-slate-900/5 dark:border-white/10 sm:p-8">
                <div className="max-w-3xl space-y-4">
                  <div className="h-4 w-28 rounded-full bg-muted/70" />
                  <div className="h-12 w-72 max-w-full rounded-full bg-muted/60" />
                  <div className="h-5 w-[32rem] max-w-full rounded-full bg-muted/60" />
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <RegistrationSkeleton key={index} />
                ))}
              </div>
            </div>
          ) : (
            <motion.div initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="space-y-8">
              <Header count={registrations.length} active={activePasses} />

              {registrations.length === 0 ? (
                <Card className="rounded-[2rem] border border-white/70 bg-background/90 shadow-sm shadow-slate-900/5 dark:border-white/10">
                  <CardContent className="flex flex-col items-center p-10 text-center sm:p-12">
                    <div className="rounded-3xl border border-violet-200/80 bg-violet-50 p-5 text-violet-600 shadow-sm dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
                      <Calendar className="h-7 w-7" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">No individual registrations yet</h3>
                    <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">Register for an event to see your individual passes here.</p>
                    <Button asChild className="mt-7 rounded-full bg-violet-600 px-5 text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500">
                      <Link href="/events">Browse Events</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {registrations.map((registration) => (
                    <RegistrationCard key={registration.id} registration={registration} onUnregister={handleUnregister} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
