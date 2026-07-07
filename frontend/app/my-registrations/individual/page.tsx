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
    <div className="rounded-[32px] border border-[#E8E1D5] bg-white p-8 shadow-[0_16px_40px_rgba(24,48,40,0.06)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0F4D3F]">My registrations</p>
          <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#183028] sm:text-4xl">
            Individual Registrations
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#5E665F] sm:text-base">
            View your individual event registrations and digital passes.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[340px]">
          <div className="rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F4D3F]">Total registrations</p>
            <p className="mt-1 font-serif text-3xl font-bold text-[#183028]">{count}</p>
          </div>
          <div className="rounded-2xl border border-[#E8E1D5] bg-[#EAF3ED] p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F4D3F]">Active passes</p>
            <p className="mt-1 font-serif text-3xl font-bold text-[#0F4D3F]">{active}</p>
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

  const activePasses = registrations.filter(
    (registration) => registration.event?.end_date && new Date(registration.event.end_date) >= new Date()
  ).length;

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
    <div className="min-h-screen bg-[#FAF8F4] py-8">
      <div className="mx-auto max-w-[1490px] px-6">
        {loading ? (
          <div className="space-y-8">
            <div className="rounded-[32px] border border-[#E8E1D5] bg-white p-8 shadow-[0_16px_40px_rgba(24,48,40,0.06)]">
              <div className="max-w-3xl space-y-4">
                <div className="h-4 w-32 rounded-full bg-[#E8E1D5]/50 animate-pulse" />
                <div className="h-10 w-72 max-w-full rounded-full bg-[#E8E1D5]/50 animate-pulse" />
                <div className="h-5 w-[32rem] max-w-full rounded-full bg-[#E8E1D5]/50 animate-pulse" />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <RegistrationSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <Header count={registrations.length} active={activePasses} />

            {registrations.length === 0 ? (
              <Card className="rounded-[28px] border border-[#E8E1D5] bg-white shadow-[0_16px_40px_rgba(24,48,40,0.06)]">
                <CardContent className="flex flex-col items-center p-10 text-center sm:p-12">
                  <div className="rounded-2xl border border-[#E8E1D5] bg-[#EAF3ED] p-5 text-[#0F4D3F] shadow-sm">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 font-serif text-2xl font-semibold tracking-tight text-[#183028]">No individual registrations yet</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#5E665F]">Register for an event to see your individual passes here.</p>
                  <Button asChild className="mt-6 rounded-full bg-[#0F4D3F] px-6 py-2.5 text-white hover:bg-[#0B3E33]">
                    <Link href="/events">Browse Events</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {registrations.map((registration) => (
                  <RegistrationCard key={registration.id} registration={registration} onUnregister={handleUnregister} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}