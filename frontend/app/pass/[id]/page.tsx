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
  try {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch (e) {
    return "Date unavailable";
  }
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[#E8E1D5] bg-[#FFFFFF] p-4 shadow-[0_12px_30px_rgba(24,48,40,0.05)] w-full min-w-0">
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
  return <Badge className={`rounded-full border border-[#E8E1D5] px-3 py-1 text-[10px] sm:text-[11px] font-medium justify-center ${tone}`}>{label}</Badge>;
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
        console.log("CRITICAL INVENTORY - API Data Payload:", data);
        setRegistration(data);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadRegistration();
  }, [params]);

  // Comprehensive deep key resolution matrix for asynchronous lazy-loaded relations
  const eventName = 
    registration?.event_name || 
    registration?.event?.title || 
    registration?.event?.name || 
    "Event Pass";

  const eventDate = 
    registration?.event_date || 
    registration?.start_date || 
    registration?.event?.start_date || 
    registration?.event?.date ||
    registration?.date;

  const eventLocation = 
    registration?.event_location || 
    registration?.location || 
    registration?.event?.location || 
    registration?.event?.venue ||
    registration?.venue;

  const organizerName = 
    registration?.organizer_name || 
    registration?.event?.organizer_name || 
    registration?.event?.organizer?.name || 
    "EventSphere";
  
  const qrData = useMemo(
    () =>
      JSON.stringify({
        registration_id: registration?.registration_id || registration?.id,
        event_id: registration?.event_id || registration?.event?.id,
        user_id: registration?.user_id,
        participant_name: registration?.participant_name || registration?.user?.name,
      }),
    [registration]
  );

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    const svg = qrWrapRef.current?.querySelector("svg");
    if (!svg) return;
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
      <div className="min-h-screen bg-[#FAF8F4] pt-24 px-4 w-full">
        <div className="mx-auto max-w-5xl space-y-6">
          <PageHeaderSkeleton />
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] pt-24 px-4 w-full">
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

  const isPaid = Boolean(registration.is_paid_event || registration?.event?.is_paid || registration?.payment_status === "completed");
  const isTeam = Boolean(registration.is_team_event || registration?.event?.is_team || registration?.team_id);
  const statusLabel = registration.status ? String(registration.status).replaceAll("_", " ") : "Active";
  const statusTone = statusLabel.toLowerCase().includes("cancel")
    ? "bg-[#FCEBEB] text-[#A24A3E]"
    : "bg-[#ECF4EF] text-[#0F4D3F]";
  const paymentLabel = isPaid ? "Paid" : "Free";
  const paymentTone = isPaid ? "bg-[#FFF7E8] text-[#A9771E]" : "bg-[#F5F2EA] text-[#183028]";
  const typeLabel = isTeam ? "Team" : "Individual";
  const typeTone = "bg-[#F5F2EA] text-[#183028]";

  return (
    // Consolidated viewport control ensuring fluid breakout over restricted sidebar wrapper widths
    <main className="w-full min-h-screen bg-[#F4FAF7] text-[#183028] block overflow-x-hidden">
      <div className="relative isolate w-full min-h-screen pb-12">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#F2F8F3] via-[#F9F5EB] to-[#FFF9F2]" />
        
        <motion.div
          className="mx-auto w-full max-w-5xl px-4 pt-24 sm:px-6 md:pt-16 lg:px-8"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        >
          {/* Header Block */}
          <div className="mb-8 w-full">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EFF7F1] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0F4D3F] shadow-sm">
              <Ticket className="h-3.5 w-3.5" />
              Wallet pass
            </span>
            <h1 className="mt-5 font-serif text-3xl sm:text-4xl md:text-[3.2rem] leading-[1.15] md:leading-[1.0] tracking-[-0.04em] text-[#183028]">
              Your event pass is ready.
            </h1>
          </div>

          {/* Unified Ticket Architecture */}
          <div className="w-full rounded-[2rem] md:rounded-[2.5rem] border border-[#E8E1D5] bg-white shadow-[0_25px_70px_rgba(24,48,40,0.06)] overflow-hidden">
            
            {/* Top Banner Accent */}
            <div className="bg-[#183028] pb-8 pt-8 px-5 sm:px-8">
              <div className="w-full">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D2E4D5]">
                  EventSphere Digital Pass
                </p>
                <h2 className="mt-2 font-serif text-2xl sm:text-3xl md:text-[2.5rem] leading-[1.2] text-white tracking-tight break-words">
                  {eventName}
                </h2>
              </div>
            </div>

            {/* Inner Content Grid */}
            <CardContent className="p-4 sm:p-6 md:p-8 space-y-6">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                
                {/* Details Pillar */}
                <div className="space-y-4 w-full min-w-0">
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                    <InfoChip icon={<UserRound className="h-4 w-4" />} label="Participant" value={registration.participant_name || registration?.user_name || "Participant"} />
                    <InfoChip icon={<Calendar className="h-4 w-4" />} label="Event date & time" value={formatDateTime(eventDate)} />
                    <InfoChip icon={<MapPin className="h-4 w-4" />} label="Location" value={eventLocation || "Venue unavailable"} />
                    <InfoChip icon={<Building2 className="h-4 w-4" />} label="Organizer" value={organizerName} />
                  </div>

                  <div className="grid gap-2 grid-cols-3 w-full pt-1">
                    <StatusBadge label={statusLabel} tone={statusTone} />
                    <StatusBadge label={paymentLabel} tone={paymentTone} />
                    <StatusBadge label={typeLabel} tone={typeTone} />
                  </div>

                  {/* Pass Metadata Box */}
                  <div className="rounded-[1.5rem] border border-[#E8E1D5] bg-[#F9FBF8] p-5 shadow-sm mt-2">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5E665F]">
                          Registration ID
                        </p>
                        <p className="mt-1 text-xl font-bold text-[#183028]">
                          #{registration.registration_id || registration?.id}
                        </p>
                      </div>
                      <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#D9D3C1] bg-white px-3 py-1 text-xs font-semibold text-[#0F4D3F]">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified Entry
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Scanner QR Pillar */}
                <div className="space-y-4 w-full">
                  <div className="rounded-[1.75rem] bg-[#F5F7F4] p-4 sm:p-6 text-center border border-[#E8E1D5]">
                    <div className="rounded-[1.25rem] bg-white p-4 inline-block shadow-sm mx-auto max-w-full">
                      <div ref={qrWrapRef} className="w-full flex items-center justify-center">
                        <QRCode value={qrData} size={200} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
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

              {/* Functional CTA Footnotes */}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 pt-2">
                <Button className="h-12 rounded-full bg-[#0F4D3F] text-white font-medium transition hover:bg-[#0C4238] w-full" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" /> Download Ticket Pass
                </Button>
                <Button variant="outline" className="h-12 rounded-full border-[#E8E1D5] bg-white text-[#183028] font-medium transition hover:bg-[#F5F2EA] w-full" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" /> Print Ticket hardcopy
                </Button>
              </div>

            </CardContent>
          </div>
        </motion.div>
      </div>
    </main>
  );
}