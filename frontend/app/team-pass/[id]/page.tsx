"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import {
  Building2,
  Calendar,
  Download,
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
    ? "bg-[#FDECEC] text-[#B42318]"
    : "bg-[#EEF7F2] text-[#0F4D3F]";

  return { label: normalized, tone };
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[#E8E1D5] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-[#F5F2EA] p-2 text-[#0F4D3F] shadow-sm">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A9771E]">
            {label}
          </p>
          <p className="mt-1 text-sm font-medium leading-6 text-[#183028]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function MemberMeta({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-[1.5rem] border border-[#E8E1D5] bg-white p-3 shadow-sm">
      <div className="rounded-2xl bg-[#F5F2EA] p-2 text-[#0F4D3F] shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A9771E]">{label}</p>
        <p className="mt-1 line-clamp-1 text-sm font-medium leading-6 text-[#183028]">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: string }) {
  return <Badge className={`rounded-full border border-[#E8E1D5] px-3 py-1 text-[11px] font-medium ${tone}`}>{label}</Badge>;
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
      <Card className="overflow-hidden rounded-[2.5rem] border border-[#E8E1D5] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        <div className="relative h-[180px] overflow-hidden sm:h-[210px]">
          {member?.event_image_url || member?.image_url ? (
            <img
              src={member.event_image_url || member.image_url}
              alt={eventName}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,#0F4D3F_0%,#183028_100%)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,77,63,0.14)_0%,rgba(24,48,40,0.3)_40%,rgba(24,48,40,0.82)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,146,47,0.22),transparent_55%)]" />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-medium text-white shadow-sm">
              <Ticket className="h-3.5 w-3.5 text-[#F4D98B]" />
              Member Pass
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-medium text-white shadow-sm sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5 text-[#F4D98B]" />
              Wallet Ready
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <div className="flex items-end justify-between gap-3">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-3xl">
                  {memberName}
                </h2>
                <p className="mt-2 text-sm text-white/85 sm:text-base">
                  Team digital pass
                </p>
              </div>
              <Badge className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-medium text-white shadow-sm">
                {memberRoleLabel}
              </Badge>
            </div>
          </div>
        </div>

        <CardContent className="space-y-5 p-5 sm:p-8">
          <div className="grid gap-3 md:grid-cols-3">
            <StatusBadge label={statusLabel} tone={statusTone} />
            <StatusBadge label={isPaid ? "Paid" : "Free"} tone={isPaid ? "bg-[#FFF6E7] text-[#A9771E]" : "bg-[#F5F2EA] text-[#183028]"} />
            <StatusBadge label={typeLabel} tone="bg-[#F5F2EA] text-[#183028]" />
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
            <div className="w-full max-w-[340px] rounded-[2rem] border border-[#E8E1D5] bg-[#F5F2EA] p-4 shadow-sm">
              <div className="rounded-[1.5rem] bg-white p-5">
                <div className="flex items-center justify-center rounded-[1.25rem] bg-[#F5F2EA] p-4">
                  {qrUrl ? (
                    <img src={qrUrl} alt={`${memberName} QR code`} className="h-[220px] w-[220px] object-contain" />
                  ) : (
                    <div className="flex h-[220px] w-[220px] items-center justify-center rounded-[1.25rem] border border-dashed border-[#E8E1D5] bg-white text-[#0F4D3F]">
                      <QrCode className="h-16 w-16" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#E8E1D5] bg-[#F5F2EA] p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <QrCode className="mt-0.5 h-5 w-5 text-[#0F4D3F]" />
              <div>
                <p className="font-medium text-[#183028]">Pass details</p>
                <p className="mt-1 text-sm leading-6 text-[#5E665F]">
                  Present this member pass at the event entrance. The organizer will scan the QR code to verify this specific member.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              className="h-12 rounded-full bg-[#0F4D3F] text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0B3E33]"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Pass
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-full border-[#E8E1D5] bg-white px-4 text-[#183028] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F5F2EA]"
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
      <div className="min-h-screen bg-[#FAF8F4] p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <PageHeaderSkeleton />
          <Card className="overflow-hidden rounded-[2rem] border border-[#E8E1D5] bg-white shadow-sm">
            <div className="h-[180px] animate-pulse bg-[linear-gradient(135deg,#F5F2EA_0%,#E8E1D5_100%)]" />
            <CardContent className="space-y-5 p-5 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="h-5 w-32 rounded-full bg-[#F5F2EA]" />
                  <div className="h-9 w-72 rounded-full bg-[#F5F2EA]" />
                  <div className="h-4 w-52 rounded-full bg-[#F5F2EA]" />
                </div>
                <div className="h-16 w-24 rounded-2xl bg-[#F5F2EA]" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 rounded-2xl bg-[#F5F2EA]" />
                ))}
              </div>
              <div className="grid gap-5">
                <div className="h-[720px] rounded-[2.5rem] bg-[#F5F2EA]" />
                <div className="h-[720px] rounded-[2.5rem] bg-[#F5F2EA]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] p-6">
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
    <div className="min-h-screen bg-[#FAF8F4]">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,#FAF8F4,#F5F2EA)]" />

        <motion.div
          className="mx-auto max-w-6xl px-6 py-8 lg:py-10"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="overflow-hidden rounded-[2.5rem] border border-[#E8E1D5] bg-white shadow-sm">
            <div className="relative h-[180px] overflow-hidden sm:h-[220px]">
              {bannerImage ? (
                <img src={bannerImage} alt={eventName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(135deg,#0F4D3F_0%,#183028_100%)]" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,77,63,0.14)_0%,rgba(24,48,40,0.3)_40%,rgba(24,48,40,0.82)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,146,47,0.22),transparent_55%)]" />

              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-medium text-white shadow-sm">
                  <Ticket className="h-3.5 w-3.5 text-[#F4D98B]" />
                  Team Pass
                </div>
                <div className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-medium text-white shadow-sm sm:inline-flex">
                  <Smartphone className="h-3.5 w-3.5 text-[#F4D98B]" />
                  Wallet Ready
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <div className="max-w-4xl space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-medium text-white shadow-sm">
                      Team digital pass
                    </Badge>
                    <StatusBadge label={statusInfo.label} tone={statusInfo.tone} />
                    <StatusBadge label={paymentLabel} tone={team.is_paid_event ? "bg-[#FFF6E7] text-[#A9771E]" : "bg-[#F5F2EA] text-[#183028]"} />
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-5xl">
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

              <div className="rounded-[2rem] border border-[#E8E1D5] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A9771E]">
                      Team information
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-[#183028]">
                      {teamName}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E1D5] bg-[#F5F2EA] px-4 py-2 text-sm font-medium text-[#0F4D3F] shadow-sm">
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
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A9771E]">Members</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#183028]">Individual member passes</h2>
                  </div>
                  <div className="hidden items-center gap-2 rounded-full border border-[#E8E1D5] bg-[#F5F2EA] px-4 py-2 text-sm font-medium text-[#183028] shadow-sm sm:inline-flex">
                    <QrCode className="h-4 w-4 text-[#0F4D3F]" />
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
