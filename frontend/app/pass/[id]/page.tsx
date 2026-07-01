"use client";

import QRCode from "react-qr-code";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { getRegistration } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, PageHeaderSkeleton } from "@/components/app/FeedbackStates";

import {
  Download,
  QrCode,
  ShieldCheck,
  Ticket,
  Calendar,
  MapPin,
  UserRound,
  Building2,
  Smartphone,
  Printer,
} from "lucide-react";

function formatDateTime(date?: string) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-background/75 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
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

function StatusBadge({ label, tone }: { label: string; tone: string }) {
  return <Badge className={`rounded-full border px-3 py-1 text-[11px] font-medium ${tone}`}>{label}</Badge>;
}

export default function PassPage() {
  const params = useParams();
  const reduceMotion = useReducedMotion();
  const qrWrapRef = useRef<HTMLDivElement | null>(null);

  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRegistration() {
      const id = params?.id;

      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const data = await getRegistration(token, Number(id));
        setRegistration(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadRegistration();
  }, [params]);

  const qrData = useMemo(
    () =>
      JSON.stringify({
        registration_id: registration?.registration_id,
        event_id: registration?.event_id,
        user_id: registration?.user_id,
        participant_name: registration?.participant_name,
      }),
    [registration]
  );

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    const svg = qrWrapRef.current?.querySelector("svg");

    if (!svg) {
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eventsphere-pass-${registration?.registration_id || registration?.id || "qr"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <PageHeaderSkeleton />
          <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-background/90 shadow-sm shadow-slate-900/5 dark:border-white/10">
            <div className="h-[180px] animate-pulse bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-muted/40" />
            <CardContent className="space-y-5 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="h-5 w-28 rounded-full bg-muted/70" />
                  <div className="h-9 w-72 rounded-full bg-muted/60" />
                  <div className="h-4 w-48 rounded-full bg-muted/60" />
                </div>
                <div className="h-16 w-24 rounded-2xl bg-muted/60" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 rounded-2xl bg-muted/60" />
                ))}
              </div>
              <div className="flex items-center justify-center pt-2">
                <div className="h-64 w-64 rounded-[2rem] bg-muted/60" />
              </div>
              <div className="h-12 rounded-2xl bg-muted/60" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-11 rounded-full bg-muted/60" />
                <div className="h-11 rounded-full bg-muted/60" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto max-w-5xl">
          <EmptyState
            icon={<Ticket className="h-5 w-5" />}
            title="Registration not found"
            description="The pass you requested is unavailable."
            actionLabel="Browse Events"
            actionHref="/events"
          />
        </div>
      </div>
    );
  }

  const isPaid = Boolean(registration.is_paid_event);
  const isTeam = Boolean(registration.is_team_event);
  const statusLabel = registration.status ? String(registration.status).replaceAll("_", " ") : "Active";
  const statusTone = statusLabel.toLowerCase().includes("cancel")
    ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  const paymentLabel = isPaid ? "Paid" : "Free";
  const paymentTone = isPaid
    ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
    : "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300";
  const typeLabel = isTeam ? "Team" : "Individual";
  const typeTone = "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.1),transparent_30%)]" />

        <motion.div
          className="mx-auto max-w-5xl px-6 py-8 lg:py-10"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.6)_100%)] shadow-2xl shadow-violet-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.82)_0%,rgba(24,24,27,0.56)_100%)]">
            <div className="relative h-[180px] overflow-hidden sm:h-[220px]">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.26)_40%,rgba(15,23,42,0.78)_100%)]" />
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/25 via-transparent to-blue-500/10" />

              <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.1),transparent_22%)]" />

              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
                  <Ticket className="h-3.5 w-3.5 text-violet-200" />
                  EventSphere Pass
                </div>
                <div className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150 sm:inline-flex">
                  <Smartphone className="h-3.5 w-3.5 text-violet-200" />
                  Wallet Ready
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <div className="max-w-3xl">
                  <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl">
                    {registration.event_name}
                  </h1>
                  <p className="mt-3 text-sm text-white/85 sm:text-base">
                    Event Registration Pass
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="space-y-6 p-5 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoChip icon={<UserRound className="h-4 w-4" />} label="Participant" value={registration.participant_name || "Participant"} />
                <InfoChip icon={<Calendar className="h-4 w-4" />} label="Event date & time" value={formatDateTime(registration.event_date || registration.start_date)} />
                <InfoChip icon={<MapPin className="h-4 w-4" />} label="Location" value={registration.event_location || registration.location || "Location unavailable"} />
                <InfoChip icon={<Building2 className="h-4 w-4" />} label="Organizer" value={registration.organizer_name || "EventSphere"} />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <StatusBadge label={statusLabel} tone={statusTone} />
                <StatusBadge label={paymentLabel} tone={paymentTone} />
                <StatusBadge label={typeLabel} tone={typeTone} />
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.94)_100%)] p-5 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
                      Registration ID
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                      #{registration.registration_id}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm dark:border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-300">
                    <ShieldCheck className="h-4 w-4" />
                    Verified Entry Pass
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div
                  ref={qrWrapRef}
                  className="w-full max-w-[320px] rounded-[2rem] border border-white/70 bg-white p-4 shadow-xl shadow-slate-900/10 dark:border-white/10"
                >
                  <div className="rounded-[1.5rem] bg-background p-5">
                    <div className="flex items-center justify-center rounded-[1.25rem] bg-white p-4">
                      <QRCode value={qrData} size={220} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-background/80 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex items-start gap-3">
                  <QrCode className="mt-0.5 h-5 w-5 text-violet-600 dark:text-violet-300" />
                  <div>
                    <p className="font-medium text-slate-950 dark:text-white">Entry Instructions</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Present this QR code at the event entrance. The organizer will scan it to verify your registration.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-4 z-10 rounded-[2rem] border border-white/70 bg-background/90 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-background/85">
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
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
