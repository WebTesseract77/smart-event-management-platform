"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  BadgeCheck,
  Calendar,
  Crown,
  Plus,
  Ticket,
  Users,
} from "lucide-react";

import { getCurrentUser, getEvent } from "@/lib/api";
import { runTeamRegistration } from "@/lib/team-registration";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const emptyMember = {
  name: "",
  email: "",
  college: "",
  branch: "",
  year: "",
  semester: "",
  is_leader: false,
};

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="rounded-[2rem] border bg-background/90 shadow-sm backdrop-blur-sm">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-violet-100 p-2 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
            {icon}
          </div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export default function TeamRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const eventId = Number(params.id);

  const [event, setEvent] = useState<any>(null);
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([{ ...emptyMember, is_leader: true }]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("Fill your team details to continue.");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);
        if (currentUser.role === "user") {
          router.push("/events");
          return;
        }

        const eventData = await getEvent(eventId);
        if (!eventData) {
          throw new Error("Event not found");
        }

        if (!eventData.is_team_event) {
          toast.error("This is not a team event.");
          router.push(`/events/${eventId}`);
          return;
        }

        setUser(currentUser);
        setEvent(eventData);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load team registration.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventId, router]);

  const isPaidEvent = Boolean(event?.is_paid_event);

  const canSubmit = useMemo(() => {
    return Boolean(teamName.trim()) && members.length > 0 && !submitting;
  }, [members.length, submitting, teamName]);

  function addMember() {
    setMembers((prev) => [...prev, { ...emptyMember }]);
  }

  function removeMember(index: number) {
    setMembers((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateMember(index: number, field: string, value: string) {
    setMembers((prev) =>
      prev.map((member, itemIndex) => (itemIndex === index ? { ...member, [field]: value } : member))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (submitting) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    if (!teamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }

    setSubmitting(true);
    setStatus(isPaidEvent ? "Preparing payment..." : "Creating team...");

    try {
      await runTeamRegistration({
        token,
        eventId,
        isPaidEvent,
        eventTitle: event?.title || "EventSphere",
        teamName: teamName.trim(),
        members,
        onSuccess: (team) => {
          toast.success(isPaidEvent ? "Team payment verified and registration complete" : "Team registered successfully");
          router.push(`/team-pass/${team.id}`);
        },
        onError: (message) => {
          toast.error(message);
          setStatus(message);
        },
        onPaymentCancelled: () => {
          toast.error("Payment cancelled");
          setStatus("Payment cancelled");
        },
        setActionLock: setSubmitting,
        statusUpdater: setStatus,
      });
    } catch (error) {
      console.error(error);
      toast.error("Registration failed");
      setStatus("Registration failed");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-32 animate-pulse rounded-[2rem] bg-background/80" />
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="h-[44rem] animate-pulse rounded-[2rem] bg-background/80" />
            <div className="h-[32rem] animate-pulse rounded-[2rem] bg-background/80" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.09),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.1),transparent_30%)]" />

        <motion.div
          className="mx-auto max-w-5xl px-6 py-8 lg:py-10"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.74)_100%)] shadow-2xl shadow-violet-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.88)_0%,rgba(24,24,27,0.62)_100%)]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-3xl">
                    <p className="inline-flex items-center gap-2 rounded-full border bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">
                      <Users className="h-3.5 w-3.5" />
                      Team Registration
                    </p>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{event.title}</h1>
                    <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
                      {isPaidEvent
                        ? "This team event requires a successful Razorpay payment before the team is created."
                        : "Fill your team details and register instantly."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="rounded-full bg-violet-100 px-3 py-1 text-[11px] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                      {isPaidEvent ? "Paid" : "Free"}
                    </Badge>
                    <Badge className="rounded-full bg-sky-100 px-3 py-1 text-[11px] text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                      {event.is_team_event ? "Team Event" : "Individual Event"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <SectionCard title="Team details" icon={<Users className="h-5 w-5" />}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Team Name</label>
                    <input
                      className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Enter a unique team name"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    {members.map((member, index) => (
                      <div key={index} className="rounded-[1.5rem] border bg-background/80 p-4 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="rounded-full bg-violet-100 p-2 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                              {member.is_leader ? <Crown className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Member {index + 1}</p>
                              <p className="text-xs text-muted-foreground">
                                {member.is_leader ? "Captain" : "Participant"}
                              </p>
                            </div>
                          </div>
                          {index > 0 ? (
                            <button
                              type="button"
                              onClick={() => removeMember(index)}
                              className="text-sm font-medium text-red-600"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <input className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20" placeholder="Name" value={member.name} onChange={(e) => updateMember(index, "name", e.target.value)} required />
                          <input className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20" placeholder="Email" type="email" value={member.email} onChange={(e) => updateMember(index, "email", e.target.value)} required />
                          <input className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20" placeholder="College" value={member.college} onChange={(e) => updateMember(index, "college", e.target.value)} required />
                          <input className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20" placeholder="Branch" value={member.branch} onChange={(e) => updateMember(index, "branch", e.target.value)} required />
                          <input className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20" placeholder="Year" value={member.year} onChange={(e) => updateMember(index, "year", e.target.value)} required />
                          <input className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20" placeholder="Semester" value={member.semester} onChange={(e) => updateMember(index, "semester", e.target.value)} required />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="outline" className="rounded-full px-4" onClick={addMember}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Member
                    </Button>
                  </div>

                  <div className="rounded-[1.5rem] border bg-violet-50/70 p-4 text-sm text-violet-900 dark:border-white/10 dark:bg-violet-500/10 dark:text-violet-100">
                    {status}
                  </div>

                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="h-12 w-full rounded-full bg-violet-600 text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500"
                  >
                    {submitting
                      ? status
                      : isPaidEvent
                        ? "Proceed to Payment"
                        : "Register Team"}
                  </Button>
                </form>
              </SectionCard>

              <SectionCard title="Event summary" icon={<Calendar className="h-5 w-5" />}>
                <div className="space-y-4">
                  <SummaryRow label="Event" value={event.title} />
                  <SummaryRow label="Date" value={new Date(event.start_date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} />
                  <SummaryRow label="Location" value={event.location || "Location unavailable"} />
                  <SummaryRow label="Deadline" value={new Date(event.registration_deadline).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} />
                  <SummaryRow label="Team size" value={`${event.min_team_size || 1} - ${event.max_team_size || 1}`} />
                  <SummaryRow label="Maximum teams" value={event.max_teams ? String(event.max_teams) : "Unlimited"} />
                  <SummaryRow label="Payment" value={isPaidEvent ? `?${Number(event.registration_fee || 0).toLocaleString("en-IN")}` : "Free"} />
                </div>
              </SectionCard>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border bg-background/80 px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="max-w-[60%] truncate text-right text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
