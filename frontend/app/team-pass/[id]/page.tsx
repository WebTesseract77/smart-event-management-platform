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
  Ticket,
  Users,
  UserRound,
  Crown,
  ShieldCheck,
  QrCode,
  BadgeCheck,
} from "lucide-react";

import { getTeam, getTeamMemberQr } from "@/lib/api";
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

function toneForStatus(status?: string) {
  const normalized = String(status || "Active").replaceAll("_", " ");
  const tone = normalized.toLowerCase().includes("cancel")
    ? "bg-[#FCEBEB] text-[#A24A3E]"
    : "bg-[#ECF4EF] text-[#0F4D3F]";

  return { label: normalized, tone };
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[#E8E1D5] bg-white p-4 shadow-[0_12px_30px_rgba(24,48,40,0.05)] w-full min-w-0">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-[#F5F2EA] p-2 text-[#0F4D3F] shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5E665F]">
            {label}
          </p>
          <p className="mt-1 text-xs sm:text-sm font-medium leading-relaxed text-[#183028] break-words">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: string }) {
  return (
    <Badge className={`rounded-full border border-[#E8E1D5] px-3 py-1 text-[10px] sm:text-[11px] font-medium justify-center ${tone}`}>
      {label}
    </Badge>
  );
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
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const memberName = member?.name || "Team member";
  const memberRoleLabel = member?.is_leader ? "Captain" : "Participant";
  const paymentLabel = isPaid ? "Paid" : "Free";
  const paymentTone = isPaid ? "bg-[#FFF7E8] text-[#A9771E]" : "bg-[#F5F2EA] text-[#183028]";

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function loadQr() {
      const token = localStorage.getItem("token");
      if (!token || !member?.id) return;

      try {
        const blob = await getTeamMemberQr(token, member.id);
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) {
          setQrUrl(objectUrl);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setQrUrl(null);
        }
      }
    }

    loadQr();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [member?.id]);

  function handleDownload() {
    if (!qrUrl) return;

    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `eventsphere-${teamName.replaceAll(" ", "-").toLowerCase()}-${memberName.replaceAll(" ", "-").toLowerCase()}-qr`;
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
      className="w-full"
    >
      <div className="w-full rounded-[2rem] md:rounded-[2.5rem] border border-[#E8E1D5] bg-white shadow-[0_25px_70px_rgba(24,48,40,0.06)] overflow-hidden">
        <div className="bg-[#183028] pb-8 pt-8 px-5 sm:px-8">
          <div className="w-full">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D2E4D5]">
              Member Pass
            </p>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl leading-[1.2] text-white tracking-tight break-words">
              {memberName}
            </h2>
            <p className="mt-1 text-sm text-[#D2E4D5]">{memberRoleLabel}</p>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6 md:p-8 space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4 w-full min-w-0">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <InfoChip icon={<UserRound className="h-4 w-4" />} label="Team name" value={teamName} />
                <InfoChip icon={<Building2 className="h-4 w-4" />} label="Event name" value={eventName} />
                <InfoChip icon={<Calendar className="h-4 w-4" />} label="Event date & time" value={eventDate} />
                <InfoChip icon={<MapPin className="h-4 w-4" />} label="Event location" value={eventLocation} />
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <InfoChip icon={<UserRound className="h-4 w-4" />} label="Member name" value={memberName} />
                <InfoChip
                  icon={member?.is_leader ? <Crown className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                  label="Captain status"
                  value={member?.is_leader ? "Captain" : "Participant"}
                />
                <InfoChip
                  icon={<BadgeCheck className="h-4 w-4" />}
                  label="Registration ID"
                  value={`#${member?.id || member?.registration_id || "N/A"}`}
                />
                <InfoChip icon={<Building2 className="h-4 w-4" />} label="Organizer" value={organizer} />
              </div>

              <div className="grid gap-2 grid-cols-3 w-full pt-1">
                <StatusBadge label={statusLabel} tone={statusTone} />
                <StatusBadge label={paymentLabel} tone={paymentTone} />
                <StatusBadge label={typeLabel} tone="bg-[#F5F2EA] text-[#183028]" />
              </div>

              <div className="rounded-[1.5rem] border border-[#E8E1D5] bg-[#F9FBF8] p-5 shadow-sm mt-2">
                <div className="flex items-start gap-3">
                  <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-[#0F4D3F]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5E665F]">
                      Pass details
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#183028]">
                      Present this member pass at the event entrance. The organizer will scan the QR code to verify this specific member.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 w-full">
              <div className="rounded-[1.75rem] bg-[#F5F7F4] p-4 sm:p-6 text-center border border-[#E8E1D5]">
                <div className="rounded-[1.25rem] bg-white p-4 inline-block shadow-sm mx-auto max-w-full">
                  <div className="w-full flex items-center justify-center">
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt={`${memberName} QR code`}
                        className="h-[180px] w-[180px] object-contain"
                      />
                    ) : (
                      <div className="flex h-[180px] w-[180px] items-center justify-center rounded-[1rem] border border-dashed border-[#E8E1D5] text-[#0F4D3F]">
                        <QrCode className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0F4D3F] mt-4">
                  Secure QR pass
                </p>
                <p className="mt-1.5 text-xs text-[#5E665F] max-w-xs mx-auto leading-normal">
                  Present this interface layout directly to the coordinator scanner upon entry.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 pt-2">
            <Button
              className="h-12 rounded-full bg-[#0F4D3F] text-white font-medium transition hover:bg-[#0C4238] w-full"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" /> Download Pass
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-full border-[#E8E1D5] bg-white text-[#183028] font-medium transition hover:bg-[#F5F2EA] w-full"
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-4 w-4" /> Print Pass
            </Button>
          </div>
        </CardContent>
      </div>
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
      <div className="min-h-screen bg-[#FAF8F4] pt-24 px-4 w-full">
        <div className="mx-auto max-w-5xl space-y-6">
          <PageHeaderSkeleton />
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] pt-24 px-4 w-full">
        <div className="mx-auto max-w-5xl">
          <EmptyState
            icon={<Ticket className="h-5 w-5" />}
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
  const paymentTone = team.is_paid_event ? "bg-[#FFF7E8] text-[#A9771E]" : "bg-[#F5F2EA] text-[#183028]";
  const teamName = team.name || team.team_name || "Team Pass";
  const eventName = team.event_title || team.event_name || team.event?.title || "Event";
  const captainName = team.captain_name || team.leader_name || team.members?.find((member: any) => member.is_leader)?.name || "Captain unavailable";
  const eventDate = formatDateTime(team.event_date || team.start_date || team.event?.start_date);
  const eventLocation = team.event_location || team.location || team.event?.location || "Location unavailable";
  const organizer = team.organizer_name || team.event?.organizer_name || "EventSphere";
  const typeLabel = "Team";

  return (
    <main className="w-full min-h-screen bg-[#F4FAF7] text-[#183028] block overflow-x-hidden">
      <div className="relative isolate w-full min-h-screen pb-12">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#F2F8F3] via-[#F9F5EB] to-[#FFF9F2]" />

        <motion.div
          className="mx-auto w-full max-w-5xl px-4 pt-24 sm:px-6 md:pt-16 lg:px-8"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        >
          <div className="mb-8 w-full">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EFF7F1] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0F4D3F] shadow-sm">
              <Ticket className="h-3.5 w-3.5" />
              Wallet pass
            </span>
            <h1 className="mt-5 font-serif text-3xl sm:text-4xl md:text-[3.2rem] leading-[1.15] md:leading-[1.0] tracking-[-0.04em] text-[#183028]">
              Your team pass is ready.
            </h1>
          </div>

          <div className="w-full rounded-[2rem] md:rounded-[2.5rem] border border-[#E8E1D5] bg-white shadow-[0_25px_70px_rgba(24,48,40,0.06)] overflow-hidden">
            <div className="bg-[#183028] pb-8 pt-8 px-5 sm:px-8">
              <div className="w-full">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D2E4D5]">
                  EventSphere Digital Pass
                </p>
                <h2 className="mt-2 font-serif text-2xl sm:text-3xl md:text-[2.5rem] leading-[1.2] text-white tracking-tight break-words">
                  {teamName}
                </h2>
                <p className="mt-1 text-sm text-[#D2E4D5]">{eventName}</p>
              </div>
            </div>

            <CardContent className="p-4 sm:p-6 md:p-8 space-y-6">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <InfoChip icon={<UserRound className="h-4 w-4" />} label="Captain" value={captainName} />
                <InfoChip icon={<Calendar className="h-4 w-4" />} label="Event date & time" value={eventDate} />
                <InfoChip icon={<MapPin className="h-4 w-4" />} label="Location" value={eventLocation} />
                <InfoChip icon={<Building2 className="h-4 w-4" />} label="Organizer" value={organizer} />
              </div>

              <div className="grid gap-2 grid-cols-3 w-full pt-1">
                <StatusBadge label={statusInfo.label} tone={statusInfo.tone} />
                <StatusBadge label={paymentLabel} tone={paymentTone} />
                <StatusBadge label={typeLabel} tone="bg-[#F5F2EA] text-[#183028]" />
              </div>

              <div className="rounded-[1.5rem] border border-[#E8E1D5] bg-[#F9FBF8] p-5 shadow-sm mt-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5E665F]">
                      Team information
                    </p>
                    <p className="mt-1 text-xl font-bold text-[#183028]">
                      {teamName}
                    </p>
                  </div>
                  <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#D9D3C1] bg-white px-3 py-1 text-xs font-semibold text-[#0F4D3F]">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified team pass
                  </div>
                </div>
                <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-3">
                  <InfoChip icon={<Users className="h-4 w-4" />} label="Members" value={String(team.members?.length || 0)} />
                  <InfoChip icon={<Crown className="h-4 w-4" />} label="Captain" value={captainName} />
                  <InfoChip icon={<BadgeCheck className="h-4 w-4" />} label="Event" value={eventName} />
                </div>
              </div>
            </CardContent>
          </div>

          <div className="mt-8 space-y-5 w-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5E665F]">
                  Members
                </p>
                <h2 className="mt-1 font-serif text-2xl leading-[1.2] text-[#183028]">
                  Individual member passes
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#EFF7F1] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0F4D3F] shadow-sm">
                <QrCode className="h-3.5 w-3.5" />
                {team.members?.length || 0} passes
              </span>
            </div>

            <div className="grid gap-5 w-full">
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
                  typeLabel={typeLabel}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}