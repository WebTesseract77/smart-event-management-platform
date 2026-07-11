"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  CheckCircle,
  ImageIcon,
  MapPin,
  Ticket,
  Users,
  X,
} from "lucide-react";

export function formatDateTime(date?: string) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function RegistrationSkeleton() {
  return (
    <Card className="overflow-hidden rounded-[24px] border border-[#E8E1D5] bg-white shadow-sm">
      <div className="h-[150px] animate-pulse bg-[linear-gradient(to_bottom,#F5F2EA,#FAF8F4)]" />
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="h-5 w-24 rounded-full bg-muted/70" />
            <div className="h-7 w-56 rounded-full bg-muted/60" />
            <div className="h-4 w-36 rounded-full bg-muted/60" />
          </div>
          <div className="h-14 w-24 rounded-2xl bg-muted/60" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 auto-rows-fr">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 rounded-2xl bg-muted/60" />
          ))}
        </div>
        <div className="mt-4 h-10 rounded-2xl bg-muted/60" />
        <div className="mt-4 flex gap-3">
          <div className="h-11 w-32 rounded-full bg-muted/60" />
          <div className="h-11 w-28 rounded-full bg-muted/60" />
        </div>
      </CardContent>
    </Card>
  );
}

export function RegistrationCard({
  registration,
  onUnregister,
}: {
  registration: any;
  onUnregister: (eventId: number) => void;
}) {
  const event = registration.event || {};
  const isTeam = Boolean(event.is_team_event);
  const isPaid = Boolean(event.is_paid_event);
  const active = event.end_date ? new Date(event.end_date) >= new Date() : true;
  const statusLabel = registration.status
    ? String(registration.status).replaceAll("_", " ")
    : active
      ? "Registered"
      : "Completed";
  const statusClass = statusLabel.toLowerCase().includes("cancel")
    ? "bg-[#FDECEC] text-[#B42318]"
    : active
      ? "bg-[#EEF7F2] text-[#0F4D3F]"
      : "bg-[#F3F1EC] text-[#6B7280]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <Card className="group h-full overflow-hidden rounded-[24px] border border-[#E8E1D5] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0F4D3F]/30 hover:shadow-xl">
        <div className="relative h-[150px] overflow-hidden bg-gradient-to-br from-[#0F4D3F]/10 via-[#C6922F]/5 to-transparent">
          {event?.image_url ? (
            <img
              src={event.image_url}
              alt={event?.title || "Event banner"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="rounded-full border border-dashed border-[#E8E1D5] bg-[#F5F2EA] p-5 text-[#0F4D3F] shadow-sm">
                <ImageIcon className="h-7 w-7" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.12)_30%,rgba(15,23,42,0.76)_100%)]" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.24em] ${statusClass}`}>
              {statusLabel}
            </Badge>
            <Badge className="rounded-full border border-[#E8E1D5] bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-[#183028]">
              {isPaid ? "Paid" : "Free"}
            </Badge>
            <Badge className="rounded-full border border-[#E8E1D5] bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-[#183028]">
              {isTeam ? "Team" : "Individual"}
            </Badge>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E1D5] bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.24em] text-[#183028] shadow-sm">
              <Ticket className="h-4 w-4 text-[#0F4D3F]" />
              {isTeam ? "Team pass" : "Event pass"}
            </div>
            <div className="rounded-full border border-[#E8E1D5] bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.24em] text-[#183028] shadow-sm">
              #{registration.id || registration.team_id}
            </div>
          </div>
        </div>

        <CardContent className="flex flex-col justify-between p-4 sm:p-5">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="line-clamp-1 text-xl font-semibold tracking-tight text-[#183028]">
                  {event?.title || registration.team_name || "Registration"}
                </h2>
                {isTeam ? (
                  <p className="mt-1.5 line-clamp-1 text-sm text-[#5E665F]">
                    {registration.team_name}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 auto-rows-fr">
              <InfoBox icon={<Calendar className="h-4 w-4" />} title="Date & time" value={formatDateTime(event?.start_date)} />
              <InfoBox icon={<MapPin className="h-4 w-4" />} title="Location" value={event?.location || "Location unavailable"} />
              <InfoBox
                icon={<Users className="h-4 w-4" />}
                title={isTeam ? "Team ID" : "Registration ID"}
                value={isTeam ? `#${registration.team_id}` : `#${registration.id}`}
              />
              <InfoBox
                icon={<CheckCircle className="h-4 w-4" />}
                title="Pass"
                value={isTeam ? "View your team pass" : "View your event pass"}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-[#D6E8DC] bg-[#EEF7F2] px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-2 text-[#0F4D3F]">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {isTeam ? "Team registration confirmed" : "Registration confirmed"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="w-full justify-center rounded-full bg-[#0F4D3F] px-5 text-white hover:bg-[#0B3E33] sm:w-auto">
              <Link href={isTeam ? `/team-pass/${registration.team_id}` : `/pass/${registration.id}`}>
                <Ticket className="mr-2 h-4 w-4" />
                {isTeam ? "View Team Pass" : "View Pass"}
              </Link>
            </Button>

            {!isTeam ? (
              <Button
                variant="destructive"
                className="w-full justify-center rounded-full px-5 sm:w-auto"
                disabled={event?.start_date && new Date(event.start_date) <= new Date()}
                onClick={() => onUnregister(registration.event_id)}
              >
                <X className="mr-2 h-4 w-4" />
                {event?.start_date && new Date(event.start_date) <= new Date()
                  ? "Event Started"
                  : "Unregister"}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InfoBox({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] p-3 sm:p-4 shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="shrink-0 rounded-xl bg-[#F5F2EA] p-2 text-[#0F4D3F]">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p
            title={value}
            className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-[#183028]"
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}