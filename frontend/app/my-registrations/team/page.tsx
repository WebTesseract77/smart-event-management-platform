"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMyTeamRegistrations } from "@/lib/api";
import { Users } from "lucide-react";
import { RegistrationSkeleton } from "@/components/app/MyRegistrationsShared";

function Header({ count }: { count: number }) {
  return (
    <div className="rounded-[24px] sm:rounded-[32px] border border-[#E8E1D5] bg-white p-5 sm:p-8 shadow-[0_16px_40px_rgba(24,48,40,0.06)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="break-words text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.24em] text-[#0F4D3F]">My registrations</p>
          <h1 className="mt-3 break-words font-serif text-3xl font-bold tracking-tight text-[#183028] sm:text-4xl">
            Team Registrations
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#5E665F] sm:text-base">
            Manage your team registrations and team passes.
          </p>
        </div>
        <div className="rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] p-4 shadow-sm lg:min-w-[180px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F4D3F]">Team registrations</p>
          <p className="mt-1 font-serif text-3xl font-bold text-[#183028]">{count}</p>
        </div>
      </div>
    </div>
  );
}

function TeamCard({ team }: { team: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="group h-full">
      <Card className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#E8E1D5] bg-white shadow-[0_4px_20px_rgba(24,48,40,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0F4D3F]/30 hover:shadow-[0_16px_40px_rgba(24,48,40,0.06)]">
        <CardContent className="flex flex-1 flex-col p-6">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="break-words font-serif text-xl font-semibold tracking-tight text-[#183028] line-clamp-2">{team.team_name}</h2>
              <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[#5E665F]">{team.event_title}</p>
            </div>
            <div className="shrink-0 rounded-xl border border-[#E8E1D5] bg-[#FAF8F4] px-3 py-1.5 text-right shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0F4D3F]">Team ID</p>
              <p className="mt-0.5 text-xs font-bold text-[#183028]">#{team.team_id}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[#E8E1D5] bg-[#EAF3ED] px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2.5 text-[#0F4D3F]">
              <Users className="h-4 w-4 shrink-0" />
              <span className="break-words text-xs font-semibold uppercase tracking-wide">Team registration confirmed</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="w-full rounded-full bg-[#0F4D3F] px-5 text-sm font-semibold text-white hover:bg-[#0B3E33]">
             <Link
  href={`/team-pass/${team.team_id}`}
  className="flex items-center justify-center"
>
  <Users className="mr-2 h-4 w-4 shrink-0" />
  View Team Pass
</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function TeamRegistrationsPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [teamRegistrations, setTeamRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    router.push("/login");
    return;
  }

  if (
    role === "admin" ||
    role === "organizer"
  ) {
    router.push("/events");
    return;
  }

  async function loadData() {
      try {
        const teamData = await getMyTeamRegistrations(token!);
        setTeamRegistrations(Array.isArray(teamData) ? teamData : []);
      } catch (error) {
        console.error(error);
        setTeamRegistrations([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAF8F4] py-8">
      <div className="mx-auto max-w-[1490px] px-3 sm:px-6">
        {loading ? (
          <div className="space-y-8">
            <div className="rounded-[24px] sm:rounded-[32px] border border-[#E8E1D5] bg-white p-5 sm:p-8 shadow-[0_16px_40px_rgba(24,48,40,0.06)]">
              <div className="max-w-3xl space-y-4">
                <div className="h-4 w-28 rounded-full bg-[#E8E1D5]/50 animate-pulse" />
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
            <Header count={teamRegistrations.length} />

            {teamRegistrations.length === 0 ? (
              <Card className="rounded-[28px] border border-[#E8E1D5] bg-white shadow-[0_16px_40px_rgba(24,48,40,0.06)]">
                <CardContent className="flex flex-col items-center p-10 text-center sm:p-12">
                  <div className="rounded-2xl border border-[#E8E1D5] bg-[#EAF3ED] p-5 text-[#0F4D3F] shadow-sm">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 font-serif text-2xl font-semibold tracking-tight text-[#183028]">No team registrations yet</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#5E665F]">Register for a team event to see your team passes here.</p>
                  <Button asChild className="mt-6 rounded-full bg-[#0F4D3F] px-6 py-2.5 text-white hover:bg-[#0B3E33]">
                    <Link href="/events">Browse Events</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {teamRegistrations.map((team) => (
                  <TeamCard key={team.team_id} team={team} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}