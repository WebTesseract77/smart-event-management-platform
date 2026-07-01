"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import { getCurrentUser } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageHeaderSkeleton } from "@/components/app/FeedbackStates";
import {
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Crown,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  UserRoundPen,
} from "lucide-react";

function getInitial(name?: string) {
  return String(name || "U").charAt(0).toUpperCase();
}

function roleLabel(role?: string) {
  if (role === "admin") return "Admin";
  if (role === "organizer") return "Organizer";
  return "Participant";
}

function roleTone(role?: string) {
  if (role === "admin") return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
  if (role === "organizer") return "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300";
  return "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300";
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.64)_100%)] p-5 shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.82)_0%,rgba(24,24,27,0.58)_100%)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`rounded-2xl p-3 shadow-sm ${tone}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-background/75 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-violet-100 p-2 text-violet-600 shadow-sm dark:bg-violet-500/15 dark:text-violet-300">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 break-all text-sm font-medium leading-6 text-slate-950 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadUser() {
      try {
        const data = await getCurrentUser(token!);
        setUser(data);
      } catch (error) {
        console.error(error);
        setError("Your session expired. Please sign in again.");
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  const memberSince = useMemo(() => {
    const raw = user?.created_at || user?.joined_at || user?.member_since;
    if (!raw) return null;

    return new Date(raw).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
    });
  }, [user]);

  const recentActivity = useMemo(() => {
    return Array.isArray(user?.recent_activity) ? user.recent_activity : [];
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 p-6 sm:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <PageHeaderSkeleton />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-3xl bg-background/80 shadow-sm" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-6 rounded-[2rem] border bg-background/80 p-6 shadow-sm">
              <div className="h-5 w-40 rounded-full bg-muted/70" />
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 rounded-2xl bg-muted/60" />
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border bg-background/80 p-6 shadow-sm">
              <div className="h-5 w-36 rounded-full bg-muted/70" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-16 rounded-2xl bg-muted/60" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 p-6 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <EmptyState
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Unable to load profile"
            description={error}
            actionLabel="Go to Login"
            actionHref="/login"
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userRole = roleLabel(user.role);
  const canShowVerification = Boolean(user.is_verified || user.email_verified || user.verified);
  const accountStatus = canShowVerification ? "Verified" : "Active";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.1),transparent_30%)]" />

        <motion.div
          className="mx-auto max-w-6xl px-6 py-8 sm:py-10 lg:py-12"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.7)_100%)] shadow-2xl shadow-violet-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.86)_0%,rgba(24,24,27,0.6)_100%)]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 flex-1 flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="relative">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(59,130,246,0.14))] text-3xl font-bold text-violet-700 shadow-xl shadow-violet-500/10 dark:border-white/10 dark:text-violet-200">
                        {getInitial(user.name)}
                      </div>
                      {canShowVerification ? (
                        <div className="absolute -bottom-1 -right-1 rounded-full border border-white/70 bg-emerald-500 p-1.5 text-white shadow-lg dark:border-white/10">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      ) : null}
                    </div>

                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                          {user.name}
                        </h1>
                        <Badge className={`rounded-full px-3 py-1 text-[11px] font-medium ${roleTone(user.role)}`}>
                          {userRole}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 shadow-sm dark:border-white/10 dark:bg-white/5">
                          <Mail className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                          {user.email}
                        </span>
                        {canShowVerification ? (
                          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-emerald-700 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                            <ShieldCheck className="h-4 w-4" />
                            Verified account
                          </span>
                        ) : null}
                      </div>
                      <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Manage your account information, update your profile, and keep your EventSphere details in sync.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className="h-11 rounded-full border-violet-200/80 bg-white px-5 text-slate-950 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                      onClick={() => router.push("/profile/edit")}
                    >
                      <UserRoundPen className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="destructive"
                      className="h-11 rounded-full px-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
                      onClick={() => {
                        localStorage.removeItem("token");
                        router.push("/login");
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <StatCard icon={<Crown className="h-5 w-5 text-violet-600 dark:text-violet-300" />} label="Role" value={userRole} tone="bg-violet-100 dark:bg-violet-500/15" />
              <StatCard icon={<Mail className="h-5 w-5 text-sky-600 dark:text-sky-300" />} label="Email on file" value={user.email} tone="bg-sky-100 dark:bg-sky-500/15" />
              <StatCard icon={<Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />} label="Account status" value={accountStatus} tone="bg-emerald-100 dark:bg-emerald-500/15" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
              <Card className="rounded-[2.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.66)_100%)] shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.82)_0%,rgba(24,24,27,0.58)_100%)]">
                <CardContent className="space-y-5 p-6 sm:p-8">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">
                      Account information
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                      Profile details
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoRow icon={<User className="h-4 w-4" />} label="Full name" value={user.name || "Name unavailable"} />
                    <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={user.email || "Email unavailable"} />
                    <InfoRow icon={<Crown className="h-4 w-4" />} label="Role" value={userRole} />
                    <InfoRow icon={<ShieldCheck className="h-4 w-4" />} label="Account status" value={accountStatus} />
                    {memberSince ? <InfoRow icon={<Clock3 className="h-4 w-4" />} label="Member since" value={memberSince} /> : null}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.66)_100%)] shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.82)_0%,rgba(24,24,27,0.58)_100%)]">
                <CardContent className="space-y-5 p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">
                        Recent activity
                      </p>
                      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                        Activity
                      </h2>
                    </div>
                    <div className="rounded-full border border-violet-200/80 bg-violet-50 px-3 py-1 text-[11px] font-medium text-violet-700 shadow-sm dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
                      <ChevronRight className="mr-1 inline h-3.5 w-3.5" />
                      Live view
                    </div>
                  </div>

                  {recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.slice(0, 4).map((item: any, index: number) => (
                        <div key={index} className="rounded-2xl border border-white/70 bg-background/75 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                          <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-violet-100 p-2 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                              <CircleUserRound className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-950 dark:text-white">{item.title || item.label || "Activity"}</p>
                              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description || item.subtitle || "Recent account activity."}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<Sparkles className="h-6 w-6" />}
                      title="No recent activity"
                      description="Your recent registrations or account activity will appear here when available."
                      actionLabel="Browse Events"
                      actionHref="/events"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
