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
    <div className="rounded-[2rem] border border-white/70 bg-background/90 px-5 py-4 shadow-sm shadow-slate-900/5 backdrop-blur-sm dark:border-white/10 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">My registrations</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Team Registrations
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
            Manage your team registrations and team passes.
          </p>
        </div>
        <div className="rounded-2xl border border-violet-200/80 bg-violet-50 px-4 py-3 shadow-sm dark:border-violet-500/20 dark:bg-violet-500/10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">Team registrations</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{count}</p>
        </div>
      </div>
    </div>
  );
}

function TeamCard({ team }: { team: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="group h-full">
      <Card className="group h-full overflow-hidden rounded-3xl border border-white/70 bg-background/90 shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:bg-background hover:shadow-lg hover:shadow-violet-500/10 dark:border-white/10">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-1 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{team.team_name}</h2>
              <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{team.event_title}</p>
            </div>
            <div className="rounded-2xl border border-violet-200/80 bg-violet-50 px-3 py-2 text-right shadow-sm dark:border-violet-500/20 dark:bg-violet-500/10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">Team ID</p>
              <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">#{team.team_id}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-2.5 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Team registration confirmed</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-violet-600 px-5 text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500">
              <Link href={`/team-pass/${team.team_id}`}>
                <Users className="mr-2 h-4 w-4" />
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
    if (!token) {
      router.push("/login");
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
              <Header count={teamRegistrations.length} />

              {teamRegistrations.length === 0 ? (
                <Card className="rounded-[2rem] border border-white/70 bg-background/90 shadow-sm shadow-slate-900/5 dark:border-white/10">
                  <CardContent className="flex flex-col items-center p-10 text-center sm:p-12">
                    <div className="rounded-3xl border border-violet-200/80 bg-violet-50 p-5 text-violet-600 shadow-sm dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
                      <Users className="h-7 w-7" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">No team registrations yet</h3>
                    <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">Register for a team event to see your team passes here.</p>
                    <Button asChild className="mt-7 rounded-full bg-violet-600 px-5 text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500">
                      <Link href="/events">Browse Events</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {teamRegistrations.map((team) => (
                    <TeamCard key={team.team_id} team={team} />
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
