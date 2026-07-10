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
  if (role === "admin") return "bg-[#FDECEC] text-[#B42318] border-[#FCDEDE]";
  if (role === "organizer") return "bg-[#FFF6E7] text-[#A9771E] border-[#FCECD3]";
  return "bg-[#ECF7EE] text-[#0F4D3F] border-[#D1ECD5]";
}

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#E8E1D5] bg-[#FAF8F4] p-4 sm:p-5 transition-all duration-300 hover:border-[#0F4D3F]/30">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#0F4D3F]/5 text-[#0F4D3F]">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C8B83]">
            {label}
          </p>
          <p className="mt-1 break-all text-sm sm:text-base font-medium tracking-tight text-[#183028]">
            {value}
          </p>
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
      <div className="min-h-screen bg-[#FAF8F4] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-[1490px] space-y-6">
          <PageHeaderSkeleton />
          <div className="h-64 animate-pulse rounded-[32px] border border-[#E8E1D5] bg-white" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-48 animate-pulse rounded-[32px] border border-[#E8E1D5] bg-white" />
            <div className="h-48 animate-pulse rounded-[32px] border border-[#E8E1D5] bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-[1490px]">
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
  const toneClass = roleTone(user.role);
  const canShowVerification = Boolean(user.is_verified || user.email_verified || user.verified);
  const accountStatus = canShowVerification ? "Verified" : "Active";

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <div className="mx-auto max-w-[1490px] px-3 py-5 sm:px-6 sm:py-8">
        <motion.div
          className="space-y-6"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* PAGE HERO CARD */}
          <Card className="overflow-hidden rounded-[24px] sm:rounded-[32px] border border-[#E8E1D5] bg-white shadow-[0_18px_45px_rgba(24,48,40,0.06)]">
            <CardContent className="p-4 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                {/* HERO LEFT */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E1D5] bg-[#F5F2EA] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0F4D3F]">
                    <User className="h-3.5 w-3.5" />
                    Account Profile
                  </div>
                  {/* 🌟 RESPONSIVE TEXT CORRECTION */}
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.1] lg:leading-[0.92] tracking-[-0.03em] lg:tracking-[-0.05em] text-[#183028]">
                    My Profile
                  </h1>
                  <p className="max-w-xl text-sm sm:text-base text-[#5E665F]">
                    Manage your personal information and account details. Review settings and identity provisions below.
                  </p>
                </div>

                {/* HERO RIGHT: PROFILE IDENTITY */}
                <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5 lg:min-w-[400px]">
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-full bg-[#0F4D3F] shadow-md flex items-center justify-center text-2xl sm:text-3xl font-semibold text-white mx-auto sm:mx-0">
                    {getInitial(user.name)}
                    {canShowVerification && (
                      <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-[#ECF7EE] p-1.5 text-[#0F4D3F]">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1 sm:space-y-1.5 text-center sm:text-left">
                    <h2 className="break-words text-lg font-semibold text-[#183028] sm:text-xl">
                      {user.name || "User Name"}
                    </h2>
                    <p className="break-all text-xs text-[#5E665F] sm:text-sm">
                      {user.email}
                    </p>
                    <div className="pt-0.5">
                      <Badge className={`rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-none ${toneClass}`}>
                        {userRole}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MAIN ACTIONS & DETAILS SECTIONS */}
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* DETAIL SECTION */}
            <Card className="rounded-[24px] sm:rounded-[32px] border border-[#E8E1D5] bg-white shadow-[0_18px_45px_rgba(24,48,40,0.06)]">
              <CardContent className="space-y-6 p-5 sm:p-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#0F4D3F]">
                    Identity Framework
                  </p>
                  <h3 className="mt-1 font-serif text-xl sm:text-2xl font-semibold text-[#183028]">
                    Personal Information
                  </h3>
                </div>

                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <InfoField icon={<User className="h-4 w-4" />} label="Full Name" value={user.name || "Name unavailable"} />
                  <InfoField icon={<Mail className="h-4 w-4" />} label="Email Address" value={user.email || "Email unavailable"} />
                  <InfoField icon={<Crown className="h-4 w-4" />} label="Account Role" value={userRole} />
                  <InfoField icon={<ShieldCheck className="h-4 w-4" />} label="Status" value={accountStatus} />
                  {memberSince && (
                    <InfoField icon={<Clock3 className="h-4 w-4" />} label="Member Since" value={memberSince} />
                  )}
                 
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button
                    onClick={() => router.push("/profile/edit")}
                    className="w-full sm:w-auto rounded-full bg-[#0F4D3F] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#0A352B] transition-colors"
                  >
                    <UserRoundPen className="mr-2 h-4 w-4" />
                    Edit profile
                  </Button>
                  <Button
                    onClick={() => {
                      localStorage.removeItem("token");
                      router.push("/login");
                    }}
                    variant="outline"
                    className="w-full sm:w-auto rounded-full border-[#E8E1D5] bg-white px-5 py-2.5 text-sm font-medium text-[#183028] shadow-sm hover:bg-[#FAF8F4] transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout securely
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ACTIVITY FEED */}
            <Card className="rounded-[24px] sm:rounded-[32px] border border-[#E8E1D5] bg-white shadow-[0_18px_45px_rgba(24,48,40,0.06)]">
              <CardContent className="space-y-6 p-5 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#0F4D3F]">
                      Timeline logs
                    </p>
                    <h3 className="mt-1 font-serif text-xl sm:text-2xl font-semibold text-[#183028]">
                      Activity Feed
                    </h3>
                  </div>
                </div>

                {recentActivity.length > 0 ? (
                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {recentActivity.slice(0, 5).map((item: any, index: number) => (
                      <div key={index} className="rounded-[18px] border border-[#E8E1D5] bg-[#FAF8F4] p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white border border-[#E8E1D5] text-[#0F4D3F]">
                            <CircleUserRound className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#183028] truncate">
                              {item.title || item.label || "Activity Event"}
                            </p>
                            <p className="mt-1 text-xs text-[#5E665F] leading-relaxed">
                              {item.description || item.subtitle || "Recent account actions recorded safely."}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Sparkles className="h-6 w-6 text-[#0F4D3F]" />}
                    title="No recent activity"
                    description="Your event logs or interactions will appear here automatically."
                    actionLabel="Browse Events"
                    actionHref="/events"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}