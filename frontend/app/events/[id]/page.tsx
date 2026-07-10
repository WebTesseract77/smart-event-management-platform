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
  deleteEvent,
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
    <Card className="rounded-[24px] border border-[#E8E1D5] bg-white shadow-[0_18px_40px_rgba(15,77,63,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(15,77,63,0.07)] flex flex-col justify-between h-full overflow-hidden">
      <CardContent className="p-4 flex-1">
        <div className="flex items-start gap-3 h-full">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-[#F5F2EA] text-[#0F4D3F] shadow-sm">
            {icon}
          </div>
          <div className="min-w-0 flex-1 w-full">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7C8B83] truncate">
              {label}
            </p>
            <p className="mt-1.5 text-sm font-semibold leading-relaxed text-[#183028] break-words whitespace-pre-wrap">
              {value}
            </p>
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
    <Card className="rounded-[24px] border border-[#E8E1D5] bg-white shadow-[0_18px_40px_rgba(15,77,63,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(15,77,63,0.07)] overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0F4D3F]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className={`font-semibold tracking-tight text-[#183028] break-words ${eyebrow ? "mt-2 text-xl sm:text-2xl" : "text-lg sm:text-xl"}`}>
          {title}
        </h2>
        <div className="mt-5 space-y-5 w-full overflow-hidden break-words">{children}</div>
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
      className={`h-11 rounded-full px-5 font-medium transition-all duration-300 hover:-translate-y-0.5 ${className}`}
    >
      {icon}
      {children}
    </Button>
  );

  if (href && !disabled) {
    return <Link href={href} className="inline-block w-auto">{button}</Link>;
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
      className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-[#E8E1D5] bg-white px-4 py-3 text-left shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FAF8F4] hover:shadow-md hover:shadow-[#0F4D3F]/5  ${
        destructive ? "hover:border-red-300/70 " : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3 flex-1">
        <div
          className={`rounded-xl p-2 shrink-0 ${
            destructive
              ? "bg-red-50 text-red-600 "
              : "bg-[#F5F2EA]  text-[#0F4D3F] "
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#183028] break-words">{title}</p>
          <p className="text-xs text-[#5E665F] break-words line-clamp-1">{subtitle}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-[#7C8B83] transition-transform duration-300 group-hover:translate-x-0.5" />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group block w-full">
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
    <div className="rounded-[20px] border border-[#E8E1D5] bg-[#FAF8F4] px-4 py-3 shadow-[0_10px_24px_rgba(15,77,63,0.02)] min-w-0 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-sm w-full">
        <p className="font-semibold uppercase tracking-[0.15em] text-[#7C8B83] text-xs shrink-0">{label}</p>
        <p className="text-sm font-semibold text-[#183028] break-words sm:text-right flex-1 min-w-0 w-full">{value}</p>
      </div>
    </div>
  );
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [event, setEvent] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          const user = await getCurrentUser(token);
          setRole(user.role);
          setUserId(user.id);
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

  const canManage =
  role === "organizer" &&
  userId !== null &&
  (
    Number(event?.organizer_id) === Number(userId) ||
    Number(event?.created_by) === Number(userId) ||
    Number(event?.organizer?.id) === Number(userId)
  );

  const startDate = useMemo(() => (event ? new Date(event.start_date) : null), [event]);
  const endDate = useMemo(() => (event ? new Date(event.end_date) : null), [event]);
  const deadlineDate = useMemo(
    () => (event ? new Date(event.registration_deadline) : null),
    [event]
  );

  if (!event) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <PageHeaderSkeleton />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(320px,0.9fr)]">
            <div className="space-y-6">
              <div className="h-[28rem] animate-pulse rounded-[2rem] bg-white" />
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-3xl bg-white" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-[22rem] animate-pulse rounded-[2rem] bg-white" />
              <div className="h-40 animate-pulse rounded-[2rem] bg-white" />
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
  const teamsRemaining = isTeamEvent ? Math.max(0, event.capacity - event.registered_count) : 0;
  
  const priceLabel = isPaid
    ? `${Number(event.registration_fee || 0).toLocaleString("en-IN", {
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

  async function handleDelete() {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      await deleteEvent(token, event.id);

      toast.success("Event deleted successfully");

      router.push("/events");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete event");
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FBF6]">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(72,187,120,0.08),transparent_24%),radial-gradient(circle_at_85%_10%,rgba(15,77,63,0.05),transparent_18%)]" />

        <motion.div
          className="mx-auto
max-w-7xl
px-3
sm:px-6 py-6 sm:px-6 lg:py-8"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(340px,0.9fr)] items-start">
            <div className="space-y-6">
              <Card className="overflow-hidden rounded-[28px] border border-[#E8E1D5] bg-white shadow-[0_26px_70px_rgba(15,77,63,0.06)] relative">
                <div className="relative w-full h-[220px] sm:h-[280px] lg:h-[340px] overflow-hidden">
                  <div className="absolute inset-0 bg-[#0F4D3F]/5 z-10" />
                  {event.image_url ? (
                    <motion.img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#F5F2EA]">
                      <ImageIcon className="h-12 w-12 text-[#0F4D3F]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                  
                 <div className="
absolute
top-4
left-4
right-4
flex
flex-wrap
gap-2
max-w-[calc(100%-2rem)]
">
                    <span className="rounded-full border border-[#E8E1D5] bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0F4D3F] shadow-sm">
                      {status}
                    </span>
                    <span className="rounded-full border border-[#E8E1D5] bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0F4D3F] shadow-sm">
                      {isTeamEvent ? "Team Event" : "Individual"}
                    </span>
                    <span className="rounded-full border border-[#E8E1D5] bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#C6922F] shadow-sm">
                      {isPaid ? `Paid` : "Free"}
                    </span>
                  </div>
                </div>

                <div className="p-4
sm:p-5
lg:p-7 bg-white relative z-20">
                  <div className="relative rounded-[24px] border border-[#E8E1D5] bg-white/95 p-5 sm:p-6 shadow-[0_12px_36px_rgba(15,77,63,0.06)] backdrop-blur-sm w-full">
                    <div className="relative pr-0 md:pr-36">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7C8B83]">Featured Event</p>
                      <h1 className="
mt-4
font-serif
text-3xl
sm:text-5xl
lg:text-[3.8rem]
leading-tight
tracking-[-0.04em]
break-words
">
                          {event.title}
                     </h1>
                      
                      <div className="absolute top-0 right-0 hidden md:block shrink-0">
                        <div className="inline-flex items-center justify-center text-center rounded-full border border-[#E8E1D5] bg-[#FAF8F4] px-4 py-2 text-xs font-bold text-[#0F4D3F] whitespace-nowrap">
                          {event.registered_count} / {event.capacity} Filled
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-[#5E665F] line-clamp-3 break-words">
                        {event.description}
                      </p>
                    </div>

                    <div className="mt-4 md:hidden block">
                      <div className="inline-flex items-center rounded-full border border-[#E8E1D5] bg-[#FAF8F4] px-3.5 py-1.5 text-xs font-bold text-[#0F4D3F]">
                        {event.registered_count} / {event.capacity} Spots Filled
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 grid-cols-1
sm:grid-cols-3 border-t border-[#E8E1D5]/60 pt-5">
                      <div className="rounded-[18px] bg-[#FAF8F4] border border-[#E8E1D5]/40 px-4 py-3 min-w-0">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C8B83]">Date & Time</span>
                        <span className="mt-1 block text-sm font-semibold text-[#183028] break-words leading-normal">{heroDate}</span>
                      </div>
                      <div className="rounded-[18px] bg-[#FAF8F4] border border-[#E8E1D5]/40 px-4 py-3 min-w-0">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C8B83]">Location / Venue</span>
                        <span className="mt-1 block text-sm font-semibold text-[#183028] break-words leading-normal">{heroLocation}</span>
                      </div>
                      <div className="rounded-[18px] bg-[#FAF8F4] border border-[#E8E1D5]/40 px-4 py-3 min-w-0">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C8B83]">Availability</span>
                        <span className="mt-1 block text-sm font-semibold text-[#0F4D3F] break-words leading-normal">
                          {isTeamEvent ? `${teamsRemaining} spots left` : `${seatsRemaining} seats left`}
                        </span>
                      </div>
                    </div>

                    <div className="
mt-6
flex
flex-col
sm:flex-row
gap-3
">
                      {role !== "admin" && role !== "organizer" && (
                        <ActionButton
                          href={
                            !isCompleted && !registrationClosed && isTeamEvent
                              ? `/team-register/${event.id}`
                              : undefined
                          }
                          onClick={!isTeamEvent ? handleRegister : undefined}
                          disabled={isCompleted || registrationClosed || isRegistered || registering}
                          className="w-full sm:w-auto bg-[#0F4D3F] text-white hover:bg-[#0B3E33] px-6 text-sm"
                        >
                          {isRegistered
                            ? "Registered"
                            : isCompleted || registrationClosed
                              ? "Registration Closed"
                              : registering
                                ? "Registering..."
                                : "Register Spot"}
                        </ActionButton>
                      )}
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-full border border-[#E8E1D5] bg-white px-5 text-sm font-medium text-[#183028] hover:bg-[#FAF8F4]"
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
                          toast.success("Link copied to clipboard!");
                        }}
                      >
                        <Share2 className="mr-2 h-4 w-4 shrink-0" />
                        Share Event
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid gap-6">
                <SectionCard eyebrow="Overview" title="What to expect">
                  <p className="text-sm leading-relaxed text-[#5E665F] whitespace-pre-wrap break-words tracking-normal">
                    {event.description}
                  </p>
                </SectionCard>

                <SectionCard eyebrow="Timeline" title="Schedule Details">
                  <div className="grid gap-4 grid-cols-1
md:grid-cols-2">
                    <InfoCard icon={<Calendar className="h-5 w-5" />} label="Event Starts" value={formatDateTime(event.start_date)} />
                    <InfoCard icon={<Calendar className="h-5 w-5" />} label="Event Ends" value={event.end_date ? formatDateTime(event.end_date) : "TBA"} />
                    <InfoCard icon={<Clock className="h-5 w-5" />} label="Registration Window Closes" value={formatDateTime(event.registration_deadline)} />
                    <InfoCard icon={<Clock className="h-5 w-5" />} label="Time Remaining" value={registrationCountdown} />
                  </div>
                </SectionCard>

                {event.rules ? (
                  <SectionCard eyebrow="Guidelines" title="Event Rules">
                    <p className="text-sm leading-relaxed text-[#5E665F] whitespace-pre-wrap break-words">{event.rules}</p>
                  </SectionCard>
                ) : null}

                {event.requirements ? (
                  <SectionCard eyebrow="Eligibility" title="Requirements & Prerequisites">
                    <p className="text-sm leading-relaxed text-[#5E665F] whitespace-pre-wrap break-words">{event.requirements}</p>
                  </SectionCard>
                ) : null}

                {event.notes ? (
                  <SectionCard eyebrow="Additional Information" title="Important Notes">
                    <p className="text-sm leading-relaxed text-[#5E665F] whitespace-pre-wrap break-words">{event.notes}</p>
                  </SectionCard>
                ) : null}

                {canManage ? (
                  <SectionCard 
                    eyebrow="Management Dashboard"
                    title="Management Options"
                  >
                    <div className="grid gap-3">
                      <ActionRow
                        href={`/edit-event/${event.id}`}
                        icon={<Pencil className="h-4 w-4" />}
                        title="Edit Event Matrix"
                        subtitle="Update general rules, dates, imagery, or capacity limits"
                      />
                      <ActionRow
                        href={`/organizer/events/${event.id}/participants`}
                        icon={<Users className="h-4 w-4" />}
                        title="Manage Registrations"
                        subtitle="View full rosters, roster exports, and team parameters"
                      />
                      <ActionRow
  href={`/organizer/events/${event.id}/attendance`}
  icon={<Calendar className="h-4 w-4" />}
  title="Attendance Tracker"
  subtitle="Launch on-site ticket lookup and QR scanner tools"
/>
                      <ActionRow
                        icon={<Trash2 className="h-4 w-4" />}
                        title="Delete Event"
                        subtitle="Permanently remove this event"
                        onClick={handleDelete}
                        destructive
                      />
                    </div>
                  </SectionCard>
                ) : null}
              </div>
            </div>

            <div className="space-y-6 lg:sticky
lg:top-24
xl:top-28">
              <Card className="rounded-[24px] border border-[#E8E1D5] bg-white shadow-[0_18px_42px_rgba(15,77,63,0.04)] overflow-hidden">
                <CardContent className="p-5 sm:p-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#0F4D3F]">
                      Registration Desk
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#183028] break-words">
                      {isCompleted ? "Booking Concluded" : registrationClosed ? "Passes Sold Out" : "Secure Your Entry"}
                    </h2>
                  </div>

                  <div className="mt-5 space-y-3.5 border-y border-[#E8E1D5]/60 py-4">
                    <div className="flex
flex-col
sm:flex-row
sm:items-start
justify-between
gap-1
sm:gap-4 text-sm">
                      <span className="text-[#5E665F] font-medium shrink-0">Pass Category</span>
                      <span className="font-semibold text-[#183028] break-words text-right">{isPaid ? "Paid Access" : "Complimentary"}</span>
                    </div>
                    <div className="flex
flex-col
sm:flex-row
sm:items-start
justify-between
gap-1
sm:gap-4 text-sm">
                      <span className="text-[#5E665F] font-medium shrink-0">Ticket Value</span>
                      <span className="font-semibold text-[#C6922F] break-words text-right">{priceLabel}</span>
                    </div>
                    <div className="flex
flex-col
sm:flex-row
sm:items-start
justify-between
gap-1
sm:gap-4 text-sm">
                      <span className="text-[#5E665F] font-medium shrink-0">Closing Window</span>
                      <span className="font-semibold text-[#183028] break-words text-right text-xs sm:text-sm">{formatDateTime(event.registration_deadline)}</span>
                    </div>
                    <div className="flex
flex-col
sm:flex-row
sm:items-start
justify-between
gap-1
sm:gap-4 text-sm">
                      <span className="text-[#5E665F] font-medium shrink-0">Time Left</span>
                      <span className="font-semibold text-[#0F4D3F] break-words text-right">{registrationCountdown}</span>
                    </div>
                    <div className="flex
flex-col
sm:flex-row
sm:items-start
justify-between
gap-1
sm:gap-4 text-sm">
                      <span className="text-[#5E665F] font-medium shrink-0">Availability</span>
                      <span className="font-semibold text-[#183028] break-words text-right">{event.registered_count} / {event.capacity} Spaces Filled</span>
                    </div>
                    
                    <div className="pt-2">
                      <div className="h-2 overflow-hidden rounded-full bg-[#E8E1D5]/60 w-full">
                        <div className="h-full rounded-full bg-[#0F4D3F]" style={{ width: `${occupancy}%` }} />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-[#5E665F]">
                        <span>{Math.round(occupancy)}% Capacity Booked</span>
                        {isTeamEvent && <span className="font-semibold text-[#183028]">{event.min_team_size || 0}–{event.max_team_size || 0} setup</span>}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    {role !== "admin" && role !== "organizer" && (
                      <ActionButton
                        href={
                          !isCompleted && !registrationClosed && isTeamEvent
                            ? `/team-register/${event.id}`
                            : undefined
                        }
                        onClick={!isTeamEvent ? handleRegister : undefined}
                        disabled={isCompleted || registrationClosed || isRegistered || registering}
                        className="w-full sm:w-auto bg-[#0F4D3F] text-white shadow-md hover:bg-[#0B3E33]"
                      >
                        {isRegistered
                          ? "Pass Awarded"
                          : isCompleted || registrationClosed
                            ? "Registration Inactive"
                            : registering
                              ? "Securing Pass..."
                              : "Register for the Event "}
                      </ActionButton>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border border-[#E8E1D5] bg-white shadow-[0_18px_42px_rgba(15,77,63,0.04)] overflow-hidden">
                <CardContent className="p-5 sm:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#0F4D3F]">
                    Quick Facts Overview
                  </p>
                 <div className="
mt-4
grid
gap-3
grid-cols-1
">
                    <StatPill label="State" value={status} />
                    <StatPill label="Venue Location" value={heroLocation} />
                    <StatPill label="Start Matrix" value={heroDate} />
                    <StatPill label={isTeamEvent ? "Team Metrics" : "Roster Size"} value={isTeamEvent ? `${event.min_team_size || 0}–${event.max_team_size || 0} Pax` : `${event.capacity} Slots`} />
                    <StatPill label="Pass Valuation" value={priceLabel} />
                    <StatPill label={isTeamEvent ? "Open Quotas" : "Available Seats"} value={isTeamEvent ? String(teamsRemaining) : String(seatsRemaining)} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}