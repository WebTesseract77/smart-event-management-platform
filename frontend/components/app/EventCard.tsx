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
  Pencil,
  Ticket,
  Trash2,
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
  isAdmin: boolean;
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

function MetaRow({
  leftIcon,
  leftLabel,
  leftValue,
  rightIcon,
  rightLabel,
  rightValue,
}: {
  leftIcon: React.ReactNode;
  leftLabel: string;
  leftValue: string;
  rightIcon: React.ReactNode;
  rightLabel: string;
  rightValue: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="min-w-0 flex items-start gap-2">
        <span className="mt-0.5 shrink-0 text-violet-600">{leftIcon}</span>
        <div className="min-w-0">
          <div className="text-[10px] text-muted-foreground">{leftLabel}</div>
          <div className="truncate font-medium text-foreground">{leftValue}</div>
        </div>
      </div>
      <div className="min-w-0 flex items-start justify-end gap-2 text-right">
        <div className="min-w-0">
          <div className="text-[10px] text-muted-foreground">{rightLabel}</div>
          <div className="truncate font-medium text-foreground">{rightValue}</div>
        </div>
        <span className="mt-0.5 shrink-0 text-violet-600">{rightIcon}</span>
      </div>
    </div>
  );
}

export default function EventCard({
  event,
  isAdmin,
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
  const status = isCompleted ? "Closed" : isLive ? "Live" : "Upcoming";
  const statusClass = isCompleted
    ? "bg-muted text-muted-foreground"
    : isLive
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
      : "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
  const occupancy = Math.min(100, (event.registered_count / event.capacity) * 100);
  const spotsLeft = Math.max(0, event.capacity - event.registered_count);

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <Card className="group h-full overflow-hidden rounded-[2rem] border bg-background/90 shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10">
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-violet-500/15 via-blue-500/10 to-transparent">
          {event.image_url ? (
            <motion.img
              src={event.image_url}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="rounded-full border border-dashed border-violet-400/30 bg-background/70 p-5 text-violet-600 backdrop-blur-sm dark:text-violet-300">
                <ImageIcon className="h-6 w-6" />
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

          <div className="absolute left-4 top-4 flex gap-1.5">
            <Badge className={`rounded-full px-2 py-0.5 text-[10px] ${statusClass}`}>{status}</Badge>
            <Badge className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 dark:bg-slate-500/15 dark:text-slate-300">
              {isTeamEvent ? "Team" : "Individual"}
            </Badge>
          </div>

          <div className="absolute bottom-4 left-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-medium text-foreground shadow-lg backdrop-blur-md">
              <Calendar className="h-3 w-3 text-violet-600" />
              <span className="truncate">{formatDate(event.start_date)}</span>
            </div>
          </div>
        </div>

        <CardContent className="flex h-auto flex-col p-4">
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="line-clamp-1 min-w-0 flex-1 text-[1.15rem] font-bold tracking-tight">
                    {event.title}
                  </h3>
                  {event.is_paid_event ? (
                    <Badge className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                      <Ticket className="mr-1 h-2.5 w-2.5" />
                      Paid
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="shrink-0 rounded-full px-2 py-0.5 text-[10px]">
                      Free
                    </Badge>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
                  {event.description}
                </p>
              </div>
            </div>

            {isTeamEvent ? (
              <MetaRow
                leftIcon={<MapPin className="h-3 w-3" />}
                leftLabel="Location"
                leftValue={event.location}
                rightIcon={<Users className="h-3 w-3" />}
                rightLabel="Team size"
                rightValue={
                  event.min_team_size && event.max_team_size
                    ? `${event.min_team_size} - ${event.max_team_size}`
                    : "Team Registration"
                }
              />
            ) : (
              <MetaRow
                leftIcon={<MapPin className="h-3 w-3" />}
                leftLabel="Location"
                leftValue={event.location}
                rightIcon={<Users className="h-3 w-3" />}
                rightLabel="Capacity"
                rightValue={`${event.capacity}`}
              />
            )}

            {isTeamEvent ? (
              <MetaRow
                leftIcon={<Clock3 className="h-3 w-3" />}
                leftLabel="Registration"
                leftValue={formatDate(event.registration_deadline)}
                rightIcon={<Ticket className="h-3 w-3" />}
                rightLabel="Team Event"
                rightValue=""
              />
            ) : (
              <MetaRow
                leftIcon={<Clock3 className="h-3 w-3" />}
                leftLabel="Registration"
                leftValue={formatDate(event.registration_deadline)}
                rightIcon={<Ticket className="h-3 w-3" />}
                rightLabel="Occupancy"
                rightValue={`${Math.round(occupancy)}%`}
              />
            )}

            {!isTeamEvent ? (
              <div className="text-[10px] text-muted-foreground">
                Registered: {event.registered_count} <span className="px-1">-</span> Spots Left: {spotsLeft}
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex flex-nowrap items-center gap-2">
            <Link href={`/events/${event.id}`} className="min-w-0 flex-1">
              <Button variant="outline" className="h-8 w-full rounded-full px-3 text-sm">
                View
              </Button>
            </Link>

            <Button
              variant="default"
              className="h-8 flex-1 rounded-full px-3 text-sm"
              disabled={isRegistered || isCompleted || registrationClosed}
              onClick={() => {
                if (event.is_team_event) {
                  window.location.href = `/team-register/${event.id}`;
                } else {
                  onRegister(event.id);
                }
              }}
            >
              {isRegistered ? "Registered" : isCompleted || registrationClosed ? "Closed" : "Register"}
            </Button>

            {isAdmin && !isCompleted ? (
              <>
                <Link href={`/edit-event/${event.id}`}>
                  <Button
                    variant="secondary"
                    className="h-8 w-8 shrink-0 rounded-full p-0"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>

                <Button
                  variant="destructive"
                  className="h-8 w-8 shrink-0 rounded-full p-0"
                  onClick={() => onDelete(event.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <Link href={`/attendance/${event.id}`}>
                  <Button
                    variant="outline"
                    className="h-8 w-8 shrink-0 rounded-full p-0"
                    aria-label="Attendance"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
