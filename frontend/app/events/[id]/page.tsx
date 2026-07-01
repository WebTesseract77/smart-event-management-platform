"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  ImageIcon,
  MapPin,
  Pencil,
  Share2,
  Ticket,
  Trash2,
  Users,
} from "lucide-react";

import {
  getCurrentUser,
  getEvent,
  getMyRegistrations,
  getMyTeamRegistrations,
} from "@/lib/api";
import { runEventRegistration } from "@/lib/event-registration";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageHeaderSkeleton } from "@/components/app/FeedbackStates";

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-2xl border border-white/70 bg-background/90 shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:bg-background hover:shadow-lg hover:shadow-violet-500/10 dark:border-white/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-violet-100 p-2 text-violet-600 shadow-sm dark:bg-violet-500/15 dark:text-violet-300">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 text-sm font-medium leading-6 text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-3xl border border-white/70 bg-background/90 shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:bg-background hover:shadow-lg hover:shadow-violet-500/10 dark:border-white/10">
      <CardContent className="p-5 sm:p-6">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">
            {eyebrow}
          </p>
        ) : null}
        <h2 className={`font-semibold tracking-tight text-slate-950 dark:text-white ${eyebrow ? "mt-1 text-xl sm:text-2xl" : "text-lg sm:text-xl"}`}>
          {title}
        </h2>
        <div className="mt-4 space-y-4">{children}</div>
      </CardContent>
    </Card>
  );
}

function ActionButton({
  href,
  children,
  variant = "default",
  icon,
  className = "",
  onClick,
  disabled,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "destructive";
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const button = (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className={`h-11 rounded-full px-4 transition-all duration-300 hover:-translate-y-0.5 ${className}`}
    >
      {icon}
      {children}
    </Button>
  );

  if (href && !disabled) {
    return <Link href={href}>{button}</Link>;
  }

  return button;
}

function ActionRow({
  icon,
  title,
  subtitle,
  href,
  onClick,
  destructive = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href?: string;
  onClick?: () => void;
  destructive?: boolean;
}) {
  const content = (
    <div
      className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-white/70 bg-background/80 px-4 py-3 text-left shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-background hover:shadow-md hover:shadow-violet-500/10 dark:border-white/10 ${
        destructive ? "hover:border-red-300/70 dark:hover:border-red-500/50" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`rounded-xl p-2 ${
            destructive
              ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300"
              : "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5" />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group block">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="group block w-full text-left">
      {content}
    </button>
  );
}

function StatPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/70 bg-background/80 px-4 py-3 shadow-sm shadow-slate-900/5 dark:border-white/10">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [event, setEvent] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          const user = await getCurrentUser(token);
          setRole(user.role);
        }

        const data = await getEvent(Number(params.id));
        setEvent(data);

        if (token) {
          const [registrations, teamRegistrations] = await Promise.all([
            getMyRegistrations(token),
            getMyTeamRegistrations(token),
          ]);

          setRegisteredEvents([
            ...registrations.map((registration: any) => registration.event_id),
            ...teamRegistrations.map((registration: any) => registration.event_id),
          ]);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, [params.id]);

  const isAdmin = role === "admin" || role === "organizer";

  const startDate = useMemo(() => (event ? new Date(event.start_date) : null), [event]);
  const endDate = useMemo(() => (event ? new Date(event.end_date) : null), [event]);
  const deadlineDate = useMemo(
    () => (event ? new Date(event.registration_deadline) : null),
    [event]
  );

  if (!event) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <PageHeaderSkeleton />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(320px,0.9fr)]">
            <div className="space-y-6">
              <div className="h-[28rem] animate-pulse rounded-[2rem] bg-background/80" />
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-3xl bg-background/80" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-[22rem] animate-pulse rounded-[2rem] bg-background/80" />
              <div className="h-40 animate-pulse rounded-[2rem] bg-background/80" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const now = new Date();
  const isCompleted = endDate ? now > endDate : false;
  const isLive = startDate && endDate ? now >= startDate && now <= endDate : false;
  const registrationClosed = deadlineDate ? now > deadlineDate : false;
  const isTeamEvent = Boolean(event.is_team_event);
  const isPaid = Boolean(event.is_paid_event);
  const status = isCompleted ? "Ended" : isLive ? "Live" : "Upcoming";
  const occupancy = Math.min(100, (event.registered_count / event.capacity) * 100);
  const seatsRemaining = Math.max(0, event.capacity - event.registered_count);
  const teamsRemaining = isTeamEvent ? Math.max(0, (event.max_team_size || 0) - (event.min_team_size || 0)) : 0;
  const priceLabel = isPaid
    ? `Paid - ${Number(event.registration_fee || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      })}`
    : "Free";
  const heroDate = startDate ? formatDateTime(startDate.toISOString()) : "";
  const heroLocation = event.location || "Location not specified";
  const registrationCountdown =
    deadlineDate && !registrationClosed
      ? `${Math.max(
          0,
          Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        )} day${
          Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) === 1 ? "" : "s"
        } left`
      : registrationClosed
        ? "Registration closed"
        : "Open now";
  const isRegistered = registeredEvents.includes(event.id);

  async function handleRegister() {
    if (registering || isCompleted || registrationClosed || isRegistered) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      return;
    }

    if (isTeamEvent) {
      window.location.href = `/team-register/${event.id}`;
      return;
    }

    setRegistering(true);

    try {
      await runEventRegistration({
        token,
        eventId: event.id,
        isPaidEvent: Boolean(event.is_paid_event),
        eventTitle: event.title,
        onSuccess: async (registrationId) => {
          toast.success(
            event.is_paid_event ? "Registration Successful!" : "Registered successfully!"
          );

          const [updatedEvent, registrations, teamRegistrations] = await Promise.all([
            getEvent(event.id),
            getMyRegistrations(token),
            getMyTeamRegistrations(token),
          ]);

          setEvent(updatedEvent);
          setRegisteredEvents([
            ...registrations.map((registration: any) => registration.event_id),
            ...teamRegistrations.map((registration: any) => registration.event_id),
          ]);

          router.push(`/pass/${registrationId}`);
        },
        onError: (message) => {
          toast.error(message);
        },
        onPaymentCancelled: () => {
          toast.error("Payment cancelled");
        },
        setActionLock: setRegistering,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to register.");
    } finally {
      setRegistering(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.14),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.1),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.08),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.18),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.14),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.12),transparent_30%)]" />

        <motion.div
          className="mx-auto max-w-7xl px-6 py-8 lg:py-10"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,0.9fr)] lg:items-start">
            <div className="space-y-8">
              <Card className="overflow-hidden rounded-[2.25rem] border border-white/70 bg-background/90 shadow-lg shadow-slate-900/5 dark:border-white/10">
                <div className="relative h-[480px] min-h-[480px] overflow-hidden bg-gradient-to-br from-violet-500/20 via-blue-500/12 to-transparent sm:h-[500px] lg:h-[520px]">
                  {event.image_url ? (
                    <motion.img
                      src={event.image_url}
                      alt={event.title}
                      className="h-full w-full object-cover"
                      whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-violet-600/70" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.12)_0%,rgba(15,23,42,0.2)_35%,rgba(15,23,42,0.82)_100%)]" />

                  <div className="absolute left-5 right-5 top-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
                        {status}
                      </Badge>
                      <Badge className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
                        {isTeamEvent ? "Team Event" : "Individual Event"}
                      </Badge>
                      <Badge className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
                        {priceLabel}
                      </Badge>
                    </div>
                    <div className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
                      {event.registered_count}/{event.capacity}
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8">
                    <div className="max-w-4xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
                          <Calendar className="h-3.5 w-3.5 text-violet-200" />
                          {heroDate}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-xl backdrop-saturate-150">
                          <MapPin className="h-3.5 w-3.5 text-violet-200" />
                          {heroLocation}
                        </div>
                      </div>

                      <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight text-white drop-shadow-md sm:text-6xl lg:text-7xl">
                        {event.title}
                      </h1>

                      <p className="mt-5 max-w-3xl text-base leading-7 text-white/90 sm:text-lg">
                        {event.description}
                      </p>

                      <div className="mt-8 flex flex-wrap gap-3">
                        <ActionButton
                          href={
                            !isCompleted && !registrationClosed && isTeamEvent
                              ? `/team-register/${event.id}`
                              : undefined
                          }
                        onClick={!isTeamEvent ? handleRegister : undefined}
                          disabled={isCompleted || registrationClosed || isRegistered || registering}
                          className="min-w-[160px] bg-violet-600 text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500"
                        >
                          {isRegistered
                            ? "Registered"
                            : isCompleted || registrationClosed
                              ? "Registration Closed"
                              : registering
                                ? "Registering..."
                                : "Register"}
                        </ActionButton>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 rounded-full border border-white/20 bg-white/10 px-5 text-white shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15 hover:text-white"
                          onClick={async () => {
                            if (navigator.share) {
                              try {
                                await navigator.share({
                                  title: event.title,
                                  text: event.description,
                                  url: window.location.href,
                                });
                                return;
                              } catch (error) {
                                console.error(error);
                              }
                            }

                            await navigator.clipboard?.writeText(window.location.href);
                          }}
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid gap-6">
                <SectionCard eyebrow="About" title="About Event">
                  <p className="max-w-4xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-[15px]">
                    {event.description}
                  </p>
                </SectionCard>

                {event.rules ? (
                  <SectionCard eyebrow="Guidelines" title="Rules">
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-[15px]">{event.rules}</p>
                  </SectionCard>
                ) : null}

                {event.requirements ? (
                  <SectionCard eyebrow="Eligibility" title="Requirements">
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-[15px]">
                      {event.requirements}
                    </p>
                  </SectionCard>
                ) : null}

                {event.notes ? (
                  <SectionCard eyebrow="Additional" title="Notes">
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-[15px]">{event.notes}</p>
                  </SectionCard>
                ) : null}

                <SectionCard eyebrow="Details" title="Event Information">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <InfoCard icon={<Calendar className="h-5 w-5" />} label="Date" value={formatDateTime(event.start_date)} />
                    <InfoCard
                      icon={<Ticket className="h-5 w-5" />}
                      label="Registration Window"
                      value={`${formatDateTime(event.registration_deadline)} deadline`}
                    />
                    <InfoCard icon={<MapPin className="h-5 w-5" />} label="Venue" value={event.location} />
                    <InfoCard
                      icon={<FileText className="h-5 w-5" />}
                      label="Organizer"
                      value={`Event creator #${event.created_by}`}
                    />
                    <InfoCard
                      icon={<Users className="h-5 w-5" />}
                      label="Team Size"
                      value={isTeamEvent ? `${event.min_team_size || 0} - ${event.max_team_size || 0}` : "Individual Event"}
                    />
                    <InfoCard
                      icon={<Users className="h-5 w-5" />}
                      label="Capacity"
                      value={isTeamEvent ? "Team Registration" : `${event.capacity}`}
                    />
                    <InfoCard icon={<CreditCard className="h-5 w-5" />} label="Payment" value={priceLabel} />
                  </div>
                </SectionCard>

                {isAdmin ? (
                  <SectionCard eyebrow="Management" title="Admin Actions">
                    <div className="grid gap-3">
                      <ActionRow
                        href={`/edit-event/${event.id}`}
                        icon={<Pencil className="h-4 w-4" />}
                        title="Edit event"
                        subtitle="Update event details"
                      />
                      <ActionRow
                        href={`/events/${event.id}/participants`}
                        icon={<Users className="h-4 w-4" />}
                        title="Participants"
                        subtitle="View attendees and teams"
                      />
                      <ActionRow
                        href={`/attendance/${event.id}`}
                        icon={<Calendar className="h-4 w-4" />}
                        title="Attendance"
                        subtitle="Open scan and attendance tools"
                      />
                      <ActionRow
                        icon={<Trash2 className="h-4 w-4" />}
                        title="Delete event"
                        subtitle="Remove this event"
                        destructive
                      />
                    </div>
                  </SectionCard>
                ) : null}
              </div>
            </div>

            <div className="space-y-4 lg:sticky lg:top-24">
              <Card className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(124,58,237,0.08)_0%,rgba(255,255,255,0.92)_20%,rgba(255,255,255,0.96)_100%)] shadow-lg shadow-violet-500/5 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(124,58,237,0.16)_0%,rgba(24,24,27,0.94)_20%,rgba(24,24,27,0.98)_100%)]">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
                        Registration Status
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                        {isCompleted ? "Event ended" : registrationClosed ? "Registration closed" : "Registration open"}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {isTeamEvent ? "Register your team before the deadline." : "Reserve your spot now."}
                      </p>
                    </div>
                    <div className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold text-violet-700 shadow-sm dark:bg-violet-500/15 dark:text-violet-300">
                      {isPaid ? "Paid" : "Free"}
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Price</span>
                      <span className="font-medium text-foreground">{priceLabel}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Deadline</span>
                      <span className="max-w-[55%] truncate font-medium text-foreground">
                        {formatDateTime(event.registration_deadline)}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Countdown</span>
                      <span className="font-medium text-foreground">{registrationCountdown}</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Progress</span>
                        <span className="font-medium text-foreground">{event.registered_count}/{event.capacity}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200/90 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 via-violet-500 to-blue-600 shadow-sm shadow-violet-600/30"
                          style={{ width: `${occupancy}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isTeamEvent ? `${event.min_team_size || 0} - ${event.max_team_size || 0} team size` : `${Math.round(occupancy)}% full`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <ActionButton
                      href={
                        !isCompleted && !registrationClosed && isTeamEvent
                          ? `/team-register/${event.id}`
                          : undefined
                      }
                      onClick={!isTeamEvent ? handleRegister : undefined}
                      disabled={isCompleted || registrationClosed || isRegistered || registering}
                      className="w-full bg-violet-600 text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500"
                    >
                      {isRegistered
                        ? "Registered"
                        : isCompleted || registrationClosed
                          ? "Registration Closed"
                          : registering
                            ? "Registering..."
                            : "Register"}
                    </ActionButton>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border border-white/70 bg-background/90 shadow-lg shadow-violet-500/5 dark:border-white/10">
                <CardContent className="p-5 sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
                    Summary
                  </p>
                  <div className="mt-4 grid gap-3">
                    <StatPill label="Status" value={status} />
                    <StatPill label="Location" value={heroLocation} />
                    <StatPill label="Date" value={heroDate} />
                    <StatPill label={isTeamEvent ? "Team size" : "Capacity"} value={isTeamEvent ? `${event.min_team_size || 0} - ${event.max_team_size || 0}` : `${event.capacity}`} />
                    <StatPill label="Price" value={priceLabel} />
                    <StatPill label={isTeamEvent ? "Teams left" : "Seats left"} value={isTeamEvent ? String(teamsRemaining) : String(seatsRemaining)} />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border border-white/70 bg-background/90 shadow-lg shadow-violet-500/5 dark:border-white/10 lg:hidden">
                <CardContent className="p-3">
                  <Button className="h-12 w-full rounded-full text-base">
                    {isCompleted || registrationClosed ? "Registration Closed" : "Register"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
