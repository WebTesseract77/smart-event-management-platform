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
    <Card className="overflow-hidden rounded-3xl border border-white/70 bg-background/90 shadow-sm shadow-slate-900/5 dark:border-white/10">
      <div className="h-[150px] animate-pulse bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-muted/40" />
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="h-5 w-24 rounded-full bg-muted/70" />
            <div className="h-7 w-56 rounded-full bg-muted/60" />
            <div className="h-4 w-36 rounded-full bg-muted/60" />
          </div>
          <div className="h-14 w-24 rounded-2xl bg-muted/60" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
    ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
    : active
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
      : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <Card className="group h-full overflow-hidden rounded-3xl border border-white/70 bg-background/90 shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:bg-background hover:shadow-lg hover:shadow-violet-500/10 dark:border-white/10">
        <div className="relative h-[150px] overflow-hidden bg-gradient-to-br from-violet-500/15 via-blue-500/10 to-transparent">
          {event?.image_url ? (
            <img
              src={event.image_url}
              alt={event?.title || "Event banner"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="rounded-full border border-dashed border-violet-300/70 bg-background/75 p-5 text-violet-600 shadow-sm backdrop-blur-sm dark:border-violet-500/25 dark:bg-white/5 dark:text-violet-300">
                <ImageIcon className="h-7 w-7" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.12)_30%,rgba(15,23,42,0.76)_100%)]" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge className={`rounded-full px-3 py-1 text-[11px] font-medium ${statusClass}`}>
              {statusLabel}
            </Badge>
            <Badge className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
              {isPaid ? "Paid" : "Free"}
            </Badge>
            <Badge className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
              {isTeam ? "Team" : "Individual"}
            </Badge>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
              <Ticket className="h-3.5 w-3.5 text-violet-200" />
              {isTeam ? "Team pass" : "Event pass"}
            </div>
            <div className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
              #{registration.id || registration.team_id}
            </div>
          </div>
        </div>

        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-1 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {event?.title || registration.team_name || "Registration"}
              </h2>
              {isTeam ? (
                <p className="mt-1.5 line-clamp-1 text-sm text-slate-600 dark:text-slate-300">
                  {registration.team_name}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
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

          <div className="mt-4 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-2.5 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {isTeam ? "Team registration confirmed" : "Registration confirmed"}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-violet-600 px-5 text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500">
              <Link href={isTeam ? `/team-pass/${registration.team_id}` : `/pass/${registration.id}`}>
                <Ticket className="mr-2 h-4 w-4" />
                {isTeam ? "View Team Pass" : "View Pass"}
              </Link>
            </Button>

            {!isTeam ? (
              <Button
                variant="destructive"
                className="rounded-full px-5"
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
    <div className="rounded-2xl border border-white/70 bg-background/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-violet-100 p-2 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-950 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
