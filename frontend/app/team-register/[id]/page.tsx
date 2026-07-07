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
    <Card className="rounded-[2rem] border border-[#E8E1D5] bg-[#FFFEFC] shadow-[0_18px_40px_rgba(15,77,63,0.04)] backdrop-blur-sm">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-[#EAF3ED] p-2 text-[#0F4D3F]">
            {icon}
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-[#183028]">{title}</h2>
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
        setUser(currentUser);

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
      <div className="min-h-screen bg-[#FAF8F4] p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-32 animate-pulse rounded-[2rem] bg-white border border-[#E8E1D5]" />
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="h-[44rem] animate-pulse rounded-[2rem] bg-white border border-[#E8E1D5]" />
            <div className="h-[32rem] animate-pulse rounded-[2rem] bg-white border border-[#E8E1D5]" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(15,77,63,0.06),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(198,146,47,0.04),transparent_22%)]" />

        <motion.div
          className="mx-auto max-w-5xl px-6 py-8 lg:py-10"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-[2.5rem] border border-[#E8E1D5] bg-[#FFFEFC] shadow-[0_26px_70px_rgba(15,77,63,0.04)] backdrop-blur-xl">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-3xl">
                    <p className="inline-flex items-center gap-2 rounded-full border border-[#E8E1D5] bg-[#F7FAF6] px-3 py-1 text-xs font-semibold text-[#0F4D3F]">
                      <Users className="h-3.5 w-3.5" />
                      Team Registration
                    </p>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl text-[#183028]">{event.title}</h1>
                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#5E665F]">
                      {isPaidEvent
                        ? "This team event requires a successful Razorpay payment before the team is created."
                        : "Fill your team details and register instantly."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="rounded-full border-none bg-[#FFF4DF] px-3 py-1 text-[11px] font-bold text-[#C6922F]">
                      {isPaidEvent ? "PAID" : "FREE"}
                    </Badge>
                    <Badge className="rounded-full border-none bg-[#EAF3ED] px-3 py-1 text-[11px] font-bold text-[#0F4D3F]">
                      TEAM EVENT
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <SectionCard title="Team details" icon={<Users className="h-5 w-5" />}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#183028]">Team Name</label>
                    <input
                      className="h-12 w-full rounded-xl border border-[#E8E1D5] bg-white px-4 text-sm text-[#183028] placeholder-[#5E665F]/40 outline-none transition focus:border-[#0F4D3F] focus:ring-4 focus:ring-[#0F4D3F]/5"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Enter a unique team name"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    {members.map((member, index) => (
                      <div key={index} className="rounded-[1.5rem] border border-[#E8E1D5] bg-white p-4 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="rounded-full bg-[#EAF3ED] p-2 text-[#0F4D3F]">
                              {member.is_leader ? <Crown className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="font-semibold text-[#183028]">Member {index + 1}</p>
                              <p className="text-xs text-[#5E665F] font-medium">
                                {member.is_leader ? "Captain" : "Participant"}
                              </p>
                            </div>
                          </div>
                          {index > 0 ? (
                            <button
                              type="button"
                              onClick={() => removeMember(index)}
                              className="text-sm font-semibold text-red-600 transition hover:text-red-700"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <input className="h-11 rounded-xl border border-[#E8E1D5] bg-white px-4 text-sm text-[#183028] outline-none transition focus:border-[#0F4D3F] focus:ring-4 focus:ring-[#0F4D3F]/5" placeholder="Name" value={member.name} onChange={(e) => updateMember(index, "name", e.target.value)} required />
                          <input className="h-11 rounded-xl border border-[#E8E1D5] bg-white px-4 text-sm text-[#183028] outline-none transition focus:border-[#0F4D3F] focus:ring-4 focus:ring-[#0F4D3F]/5" placeholder="Email" type="email" value={member.email} onChange={(e) => updateMember(index, "email", e.target.value)} required />
                          <input className="h-11 rounded-xl border border-[#E8E1D5] bg-white px-4 text-sm text-[#183028] outline-none transition focus:border-[#0F4D3F] focus:ring-4 focus:ring-[#0F4D3F]/5" placeholder="College" value={member.college} onChange={(e) => updateMember(index, "college", e.target.value)} required />
                          <input className="h-11 rounded-xl border border-[#E8E1D5] bg-white px-4 text-sm text-[#183028] outline-none transition focus:border-[#0F4D3F] focus:ring-4 focus:ring-[#0F4D3F]/5" placeholder="Branch" value={member.branch} onChange={(e) => updateMember(index, "branch", e.target.value)} required />
                          <input className="h-11 rounded-xl border border-[#E8E1D5] bg-white px-4 text-sm text-[#183028] outline-none transition focus:border-[#0F4D3F] focus:ring-4 focus:ring-[#0F4D3F]/5" placeholder="Year" value={member.year} onChange={(e) => updateMember(index, "year", e.target.value)} required />
                          <input className="h-11 rounded-xl border border-[#E8E1D5] bg-white px-4 text-sm text-[#183028] outline-none transition focus:border-[#0F4D3F] focus:ring-4 focus:ring-[#0F4D3F]/5" placeholder="Semester" value={member.semester} onChange={(e) => updateMember(index, "semester", e.target.value)} required />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="outline" className="rounded-full border-[#E8E1D5] px-5 font-medium text-[#183028] hover:bg-[#FAF8F4]" onClick={addMember}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Member
                    </Button>
                  </div>

                  <div className="rounded-[1.5rem] border border-[#E8E1D5] bg-[#F7FAF6] p-4 text-sm text-[#183028] font-medium leading-relaxed">
                    {status}
                  </div>

                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="h-12 w-full rounded-full bg-[#0F4D3F] text-white font-medium shadow-md shadow-[#0F4D3F]/10 transition hover:bg-[#0B3E33]"
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
                  <SummaryRow label="Payment" value={isPaidEvent ? `₹${Number(event.registration_fee || 0).toLocaleString("en-IN")}` : "Free"} />
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
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] px-4 py-3 shadow-[0_4px_12px_rgba(15,77,63,0.01)]">
      <p className="text-sm font-medium text-[#5E665F] shrink-0">{label}</p>
      <p className="max-w-[65%] truncate text-right text-sm font-semibold text-[#183028]">{value}</p>
    </div>
  );
}