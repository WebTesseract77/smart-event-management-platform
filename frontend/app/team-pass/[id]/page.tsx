"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import {
  Building2,
  Calendar,
  Download,
  Mail,
  MapPin,
  Printer,
  Smartphone,
  Ticket,
  Users,
  UserRound,
  Crown,
  ShieldCheck,
  QrCode,
  BadgeCheck,
} from "lucide-react";

import { getTeam } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageHeaderSkeleton } from "@/components/app/FeedbackStates";

function formatDateTime(date?: string) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function resolveQrUrl(path?: string) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const normalized = path.replaceAll("\\", "/").replace(/^\/+/, "");
  const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  return `${base}/${normalized}`;
}

function toneForStatus(status?: string) {
  const normalized = String(status || "Active").replaceAll("_", " ");
  const tone = normalized.toLowerCase().includes("cancel")
    ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";

  return { label: normalized, tone };
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-background/75 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-violet-100 p-2 text-violet-600 shadow-sm dark:bg-violet-500/15 dark:text-violet-300">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-950 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function MemberMeta({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/70 bg-background/75 p-3 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
      <div className="rounded-xl bg-violet-100 p-2 text-violet-600 shadow-sm dark:bg-violet-500/15 dark:text-violet-300">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 line-clamp-1 text-sm font-medium leading-6 text-slate-950 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: string }) {
  return <Badge className={`rounded-full border px-3 py-1 text-[11px] font-medium ${tone}`}>{label}</Badge>;
}

function TeamMemberPass({
  member,
  teamName,
  eventName,
  eventDate,
  eventLocation,
  organizer,
  isPaid,
  statusLabel,
  statusTone,
  typeLabel,
}: {
  member: any;
  teamName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  organizer: string;
  isPaid: boolean;
  statusLabel: string;
  statusTone: string;
  typeLabel: string;
}) {
  const qrUrl = resolveQrUrl(member?.qr_code_path);
  const memberName = member?.name || "Team member";
  const memberRoleLabel = member?.is_leader ? "Captain" : "Participant";
  const initial = String(memberName || member?.email || "M").charAt(0).toUpperCase();

  function handleDownload() {
    if (!qrUrl) return;

    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `eventsphere-${teamName.replaceAll(" ", "-").toLowerCase()}-${memberName.replaceAll(" ", "-").toLowerCase()}-qr`;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.click();
  }

  function handlePrint() {
    window.print();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <Card className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.62)_100%)] shadow-2xl shadow-violet-500/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-violet-500/15 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.82)_0%,rgba(24,24,27,0.56)_100%)]">
        <div className="relative h-[180px] overflow-hidden sm:h-[210px]">
          {member?.event_image_url || member?.image_url ? (
            <img
              src={member.event_image_url || member.image_url}
              alt={eventName}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-violet-500/20 via-indigo-500/15 to-blue-500/10" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.26)_40%,rgba(15,23,42,0.82)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/25 via-transparent to-blue-500/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.1),transparent_22%)]" />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
              <Ticket className="h-3.5 w-3.5 text-violet-200" />
              Member Pass
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150 sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5 text-violet-200" />
              Wallet Ready
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <div className="flex items-end justify-between gap-3">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-md sm:text-3xl">
                  {memberName}
                </h2>
                <p className="mt-2 text-sm text-white/85 sm:text-base">
                  Team digital pass
                </p>
              </div>
              <Badge className={`rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150 ${member?.is_leader ? "" : ""}`}>
                {memberRoleLabel}
              </Badge>
            </div>
          </div>
        </div>

        <CardContent className="space-y-5 p-5 sm:p-8">
          <div className="grid gap-3 md:grid-cols-3">
            <StatusBadge label={statusLabel} tone={statusTone} />
            <StatusBadge label={isPaid ? "Paid" : "Free"} tone={isPaid ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" : "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"} />
            <StatusBadge label={typeLabel} tone="bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoChip icon={<UserRound className="h-4 w-4" />} label="Team name" value={teamName} />
            <InfoChip icon={<Building2 className="h-4 w-4" />} label="Event name" value={eventName} />
            <InfoChip icon={<Calendar className="h-4 w-4" />} label="Event date & time" value={eventDate} />
            <InfoChip icon={<MapPin className="h-4 w-4" />} label="Event location" value={eventLocation} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MemberMeta label="Member name" value={memberName} icon={<UserRound className="h-4 w-4" />} />
            <MemberMeta label="Captain status" value={member?.is_leader ? "Captain" : "Participant"} icon={member?.is_leader ? <Crown className="h-4 w-4" /> : <Users className="h-4 w-4" />} />
            <MemberMeta label="Registration ID" value={`#${member?.id || member?.registration_id || "N/A"}`} icon={<BadgeCheck className="h-4 w-4" />} />
            <MemberMeta label="Organizer" value={organizer} icon={<Building2 className="h-4 w-4" />} />
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-[340px] rounded-[2rem] border border-white/70 bg-white p-4 shadow-xl shadow-slate-900/10 dark:border-white/10">
              <div className="rounded-[1.5rem] bg-background p-5">
                <div className="flex items-center justify-center rounded-[1.25rem] bg-white p-4">
                  {qrUrl ? (
                    <img src={qrUrl} alt={`${memberName} QR code`} className="h-[220px] w-[220px] object-contain" />
                  ) : (
                    <div className="flex h-[220px] w-[220px] items-center justify-center rounded-[1.25rem] border border-dashed border-violet-300/70 bg-violet-50 text-violet-600 dark:border-violet-500/25 dark:bg-white/5 dark:text-violet-300">
                      <QrCode className="h-16 w-16" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-background/80 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start gap-3">
              <QrCode className="mt-0.5 h-5 w-5 text-violet-600 dark:text-violet-300" />
              <div>
                <p className="font-medium text-slate-950 dark:text-white">Pass details</p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Present this member pass at the event entrance. The organizer will scan the QR code to verify this specific member.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              className="h-12 rounded-full bg-violet-600 text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Pass
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-full border-violet-200/80 bg-white px-4 text-slate-950 shadow-sm hover:border-violet-300 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Pass
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function TeamPassPage() {
  const params = useParams();
  const reduceMotion = useReducedMotion();

  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTeam() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view this team pass.");
        setLoading(false);
        return;
      }

      try {
        const data = await getTeam(token, Number(params.id));
        setTeam(data);
      } catch (error) {
        console.error(error);
        setError("Unable to load team pass.");
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <PageHeaderSkeleton />
          <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-background/90 shadow-sm shadow-slate-900/5 dark:border-white/10">
            <div className="h-[180px] animate-pulse bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-muted/40" />
            <CardContent className="space-y-5 p-5 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="h-5 w-32 rounded-full bg-muted/70" />
                  <div className="h-9 w-72 rounded-full bg-muted/60" />
                  <div className="h-4 w-52 rounded-full bg-muted/60" />
                </div>
                <div className="h-16 w-24 rounded-2xl bg-muted/60" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 rounded-2xl bg-muted/60" />
                ))}
              </div>
              <div className="grid gap-5">
                <div className="h-[720px] rounded-[2.5rem] bg-muted/60" />
                <div className="h-[720px] rounded-[2.5rem] bg-muted/60" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto max-w-5xl">
          <EmptyState
            icon={<Ticket className="h-6 w-6" />}
            title="Team pass unavailable"
            description={error || "The team pass you requested is unavailable."}
            actionLabel="Browse Events"
            actionHref="/events"
          />
        </div>
      </div>
    );
  }

  const statusInfo = toneForStatus(team.status);
  const paymentLabel = team.is_paid_event ? "Paid" : "Free";
  const teamName = team.name || team.team_name || "Team Pass";
  const eventName = team.event_title || team.event_name || team.event?.title || "Event";
  const captainName = team.captain_name || team.leader_name || team.members?.find((member: any) => member.is_leader)?.name || "Captain unavailable";
  const eventDate = formatDateTime(team.event_date || team.start_date || team.event?.start_date);
  const eventLocation = team.event_location || team.location || team.event?.location || "Location unavailable";
  const organizer = team.organizer_name || team.event?.organizer_name || "EventSphere";
  const bannerImage = team.event_image_url || team.image_url || team.event?.image_url;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.1),transparent_30%)]" />

        <motion.div
          className="mx-auto max-w-6xl px-6 py-8 lg:py-10"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.6)_100%)] shadow-2xl shadow-violet-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.82)_0%,rgba(24,24,27,0.56)_100%)]">
            <div className="relative h-[180px] overflow-hidden sm:h-[220px]">
              {bannerImage ? (
                <img src={bannerImage} alt={eventName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-violet-500/20 via-indigo-500/15 to-blue-500/10" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.26)_40%,rgba(15,23,42,0.82)_100%)]" />
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/25 via-transparent to-blue-500/10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.1),transparent_22%)]" />

              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
                  <Ticket className="h-3.5 w-3.5 text-violet-200" />
                  Team Pass
                </div>
                <div className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150 sm:inline-flex">
                  <Smartphone className="h-3.5 w-3.5 text-violet-200" />
                  Wallet Ready
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <div className="max-w-4xl space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
                      Team digital pass
                    </Badge>
                    <StatusBadge label={statusInfo.label} tone={statusInfo.tone} />
                    <StatusBadge label={paymentLabel} tone={team.is_paid_event ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" : "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"} />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl">
                    {teamName}
                  </h1>
                  <p className="max-w-3xl text-sm text-white/85 sm:text-base">
                    {eventName}
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="space-y-8 p-5 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoChip icon={<UserRound className="h-4 w-4" />} label="Captain" value={captainName} />
                <InfoChip icon={<Calendar className="h-4 w-4" />} label="Event date & time" value={eventDate} />
                <InfoChip icon={<MapPin className="h-4 w-4" />} label="Location" value={eventLocation} />
                <InfoChip icon={<Building2 className="h-4 w-4" />} label="Organizer" value={organizer} />
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.94)_100%)] p-5 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)]">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
                      Team information
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                      {teamName}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm dark:border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-300">
                    <ShieldCheck className="h-4 w-4" />
                    Verified team pass
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <InfoChip icon={<Users className="h-4 w-4" />} label="Members" value={String(team.members?.length || 0)} />
                  <InfoChip icon={<Crown className="h-4 w-4" />} label="Captain" value={captainName} />
                  <InfoChip icon={<BadgeCheck className="h-4 w-4" />} label="Event" value={eventName} />
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">Members</p>
                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Individual member passes</h2>
                  </div>
                  <div className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200 sm:inline-flex">
                    <QrCode className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                    {team.members?.length || 0} passes
                  </div>
                </div>

                <div className="grid gap-5">
                  {(team.members || []).map((member: any) => (
                    <TeamMemberPass
                      key={member.id || member.email}
                      member={member}
                      teamName={teamName}
                      eventName={eventName}
                      eventDate={eventDate}
                      eventLocation={eventLocation}
                      organizer={organizer}
                      isPaid={Boolean(team.is_paid_event)}
                      statusLabel={statusInfo.label}
                      statusTone={statusInfo.tone}
                      typeLabel="Team"
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
