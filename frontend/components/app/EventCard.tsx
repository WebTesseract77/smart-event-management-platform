"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock3,
  ImageIcon,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  image_url?: string | null;
  capacity: number;
  registered_count: number;
  is_team_event: boolean;
  min_team_size: number;
  max_team_size: number;
  is_paid_event?: boolean;
  registration_fee?: number;
  organizer_name?: string;
}

interface EventCardProps {
  event: Event;
  role: string;
  canManage: boolean;
  isRegistered: boolean;
  onRegister: (eventId: number) => void;
  onDelete: (eventId: number) => void;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
  });
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF7F2] text-[#0F4D3F]">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B948C]">
          {label}
        </div>
        <div className="truncate text-[13px] font-semibold text-[#0F4D3F]" title={value}>
          {value}
        </div>
      </div>
    </div>
  );
}

export default function EventCard({
  event,
  role,
  canManage,
  isRegistered,
  onRegister,
  onDelete,
}: EventCardProps) {
  const reduceMotion = useReducedMotion();
  const now = new Date();
  const start = new Date(event.start_date);
  const end = new Date(event.end_date);
  const registrationClosed = now > new Date(event.registration_deadline);
  const isCompleted = now > end;
  const isLive = now >= start && now <= end;
  const isTeamEvent = Boolean(event.is_team_event);
  const status = isCompleted ? "Ended" : isLive ? "Live" : "Upcoming";

  const statusClass = isCompleted
    ? "bg-[#F3F1EC] text-[#6B7280]"
    : isLive
      ? "bg-[#E8F4EC] text-[#0F4D3F]"
      : "bg-[#FFF6E7] text-[#C6922F]";

  const hasRemainingData =
    typeof event.capacity === "number" && typeof event.registered_count === "number";
  const remaining = hasRemainingData
    ? Math.max(0, event.capacity - event.registered_count)
    : event.capacity;

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <Card className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#E8E1D5] bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0F4D3F]/30 hover:shadow-[0_16px_42px_rgba(15,77,63,0.10)]">
        <div className="relative h-[160px] shrink-0 overflow-hidden bg-[#FAF8F4] sm:h-[190px]">
          {event.image_url ? (
            <motion.img
              src={event.image_url}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-500"
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#F5F2EA] to-[#EDE7DA]">
              <div className="rounded-full border border-dashed border-[#D8CFBE] bg-white/70 p-5 text-[#0F4D3F]">
                <ImageIcon className="h-5 w-5" />
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass}`}>
              {status}
            </Badge>
            <Badge className="rounded-full border border-[#E8E1D5] bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#183028]">
              {isTeamEvent ? "Team" : "Individual"}
            </Badge>
          </div>

          <div className="absolute bottom-3 left-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E1D5] bg-white px-3 py-1 text-[10px] font-semibold text-[#183028] shadow-sm">
              <Calendar className="h-3 w-3 text-[#C6922F]" />
              <span className="truncate">{formatDate(event.start_date)}</span>
            </div>
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col px-6 py-5">
          <div className="flex items-center gap-2">
            <h3 className="line-clamp-1 min-w-0 flex-1 text-[20px] font-bold tracking-tight text-[#0F3D32]">
              {event.title}
            </h3>
            {event.is_paid_event ? (
              <Badge className="shrink-0 rounded-full border border-[#E8E1D5] bg-[#FFF6E7] px-2.5 py-1 text-[10px] font-semibold text-[#A9771E]">
                <Ticket className="mr-1 h-3 w-3" />
                Paid
              </Badge>
            ) : (
              <Badge variant="secondary" className="shrink-0 rounded-full border border-[#D6E8DC] bg-[#EEF7F2] px-2.5 py-1 text-[10px] font-semibold text-[#0F4D3F]">
                Free
              </Badge>
            )}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-[#5E665F] line-clamp-2 break-words">
            {event.description}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
            <MetaItem
              icon={<MapPin className="h-3.5 w-3.5" />}
              label="Location"
              value={event.location}
            />
            <MetaItem
              icon={<Users className="h-3.5 w-3.5" />}
              label={isTeamEvent ? "Team Size" : "Capacity"}
              value={isTeamEvent ? `${event.min_team_size} - ${event.max_team_size}` : `${event.capacity}`}
            />
            <MetaItem
              icon={<Clock3 className="h-3.5 w-3.5" />}
              label="Starts"
              value={formatShortDate(event.start_date)}
            />
            <MetaItem
              icon={<Ticket className="h-3.5 w-3.5" />}
              label={isTeamEvent ? "Slots Left" : "Seats Left"}
              value={`${remaining}`}
            />
          </div>

          <div className="mt-6 flex items-center gap-3">

  <Link href={`/events/${event.id}`} className="flex-1">
    <Button
      variant="outline"
      className="h-11 w-full rounded-[14px] border-[#E8E1D5] bg-[#FAF8F4] text-sm hover:bg-[#F0EBDF]"
    >
      Details
    </Button>
  </Link>


  {role !== "admin" && role !== "organizer" && (
    <Button
      className="h-11 flex-1 rounded-[14px] bg-[#0F4D3F] text-sm text-white hover:bg-[#0B3E33]"
      disabled={
        isRegistered ||
        isCompleted ||
        registrationClosed
      }
      onClick={() => {
        if (event.is_team_event) {
          window.location.href =
            `/team-register/${event.id}`;
        } else {
          onRegister(event.id);
        }
      }}
    >
      {isRegistered
        ? "Registered"
        : isCompleted || registrationClosed
        ? "Closed"
        : "Register"}
    </Button>
  )}


  {canManage && (
    <Button
      onClick={() => onDelete(event.id)}
      className="h-11 flex-1 rounded-[14px] bg-red-600 text-white hover:bg-red-700"
    >
      Delete
    </Button>
  )}

</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}