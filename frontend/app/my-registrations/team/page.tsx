"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMyTeamRegistrations } from "@/lib/api";
import { Calendar, Crown, MapPin, Ticket, Users, CheckCircle2 } from "lucide-react";
import { RegistrationSkeleton } from "@/components/app/MyRegistrationsShared";

function formatDateTime(date?: string) {
  if (!date) return "Date unavailable";
  try {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "Date unavailable";
  }
}

function Header({ count }: { count: number }) {
  return (
    <div className="rounded-[24px] sm:rounded-[32px] border border-[#E8E1D5] bg-white p-5 sm:p-8 shadow-[0_16px_40px_rgba(24,48,40,0.06)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="break-words text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.24em] text-[#0F4D3F]">My registrations</p>
          <h1 className="mt-3 break-words font-serif text-3xl font-bold tracking-tight text-[#183028] sm:text-4xl">
            Team Registrations
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#5E665F] sm:text-base">
            Manage your team registrations and digital team passes.
          </p>
        </div>
        <div className="rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] p-4 shadow-sm lg:min-w-[180px]">
          <p className="break-words text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] sm:tracking-[0.18em] text-[#0F4D3F]">Total registrations</p>
          <p className="mt-1 font-serif text-3xl font-bold text-[#183028]">{count}</p>
        </div>
      </div>
    </div>
  );
}

function PillBadge({ label, tone }: { label: string; tone: string }) {
  return (
    <Badge className={`rounded-full border border-white/20 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm backdrop-blur-md ${tone}`}>
      {label}
    </Badge>
  );
}

function FieldChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] p-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="shrink-0 pt-[1px] text-[#0F4D3F]">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[9px] font-bold uppercase tracking-[0.14em] text-[#0F4D3F]">
            {label}
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold text-[#183028]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ElegantFallbackHero() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0F4D3F]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#183028,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#0A241D,transparent_60%)]" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.15]" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="grid-pattern" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="1" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" className="text-white" />
      </svg>
    </div>
  );
}

function TeamCard({ team }: { team: any }) {
  const isPaid = Boolean(team.is_paid_event);
  const paymentLabel = isPaid ? "PAID" : "FREE";
  const statusLabel = team.status ? String(team.status).replaceAll("_", " ").toUpperCase() : "REGISTERED";
  
  const bannerImage = team.event_image_url || team.image_url || team.event?.image_url || team.event?.banner_url;
  const eventDate = formatDateTime(team.event_date || team.start_date || team.event?.start_date || team.event?.date);
  const eventLocation = team.event_location || team.location || team.event?.location || team.event?.venue || "Location unavailable";
  const captainName = team.captain_name || team.leader_name || team.members?.find((member: any) => member.is_leader)?.name || "Captain unavailable";
  const memberCount = team.member_count ?? team.members?.length ?? "—";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="group h-full">
      <Card className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#E8E1D5] bg-white shadow-[0_4px_20px_rgba(24,48,40,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0F4D3F]/30 hover:shadow-[0_16px_40px_rgba(24,48,40,0.08)]">
        
        <div className="relative h-44 w-full overflow-hidden shrink-0">
          {bannerImage ? (
            <img src={bannerImage} alt={team.event_title || "Event Image"} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <ElegantFallbackHero />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <PillBadge label={statusLabel} tone={statusLabel.includes("CANCEL") ? "text-[#B42318]" : "text-[#0F4D3F]"} />
            <PillBadge label={paymentLabel} tone="text-[#A9771E]" />
            <PillBadge label="TEAM" tone="text-[#183028]" />
          </div>
          <div className="absolute bottom-4 left-4 flex gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#183028] shadow-sm backdrop-blur-md">
              <Ticket className="h-3.5 w-3.5 shrink-0 text-[#0F4D3F]" />
              Team pass
            </span>
            <span className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/90 px-3 py-1.5 text-[10px] font-bold text-[#183028] shadow-sm backdrop-blur-md">
              #{team.team_id}
            </span>
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="min-w-0">
            {/* LARGE BOLD TITLE MATCHING REFERENCE */}
            <h2 className="break-words font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#183028] line-clamp-1">
              {team.event_title || "Event Name Unavailable"}
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3">
            <FieldChip icon={<Calendar className="h-[15px] w-[15px]" />} label="Date & Time" value={eventDate} />
            <FieldChip icon={<MapPin className="h-[15px] w-[15px]" />} label="Location" value={eventLocation} />
            <FieldChip icon={<Crown className="h-[15px] w-[15px]" />} label="Captain" value={captainName} />
            <FieldChip icon={<Users className="h-[15px] w-[15px]" />} label="Members" value={String(memberCount)} />
          </div>

          <div className="mt-5 rounded-xl border border-[#E8E1D5] bg-[#EAF3ED] px-4 py-3.5 shadow-sm">
            <div className="flex items-center justify-center gap-2 text-[#0F4D3F]">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
              <span className="break-words text-[11px] font-bold uppercase tracking-wider">
                Team registration confirmed
              </span>
            </div>
          </div>

          <div className="mt-4 pt-2">
            <Button asChild className="h-11 w-full rounded-full bg-[#0F4D3F] px-5 text-[13px] font-semibold tracking-wide text-white transition-colors hover:bg-[#0B3E33]">
              <Link href={`/team-pass/${team.team_id}`} className="flex items-center justify-center">
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

    if (role === "admin" || role === "organizer") {
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
              {Array.from({ length: 3 }).map((_, index) => (
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
                  <h3 className="mt-6 font-serif text-2xl font-bold tracking-tight text-[#183028]">No team registrations yet</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#5E665F]">Register for a team event to see your team passes here.</p>
                  <Button asChild className="mt-6 h-11 rounded-full bg-[#0F4D3F] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0B3E33]">
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