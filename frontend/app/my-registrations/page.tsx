"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Users, CheckCircle2, ChevronRight } from "lucide-react";

function OptionCard({
  href,
  icon,
  title,
  description,
  bullets,
  index,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  bullets: string[];
  index: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      className="h-full"
    >
      <Link
        href={href}
        className="group flex h-full flex-col rounded-[24px] sm:rounded-[28px] border border-[#E8E1D5] bg-white p-5 sm:p-8 shadow-[0_16px_40px_rgba(24,48,40,0.06)] transition-all duration-300 hover:border-[#0F4D3F]/30 hover:bg-[#EAF3ED]/10"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[#EAF3ED] text-[#0F4D3F] shadow-sm transition duration-300 group-hover:scale-105">
            {icon}
          </div>
          <div className="rounded-full border border-[#E8E1D5] bg-[#FAF8F4] px-3.5 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0F4D3F]">
            {index === 0 ? "Individual" : "Team"}
          </div>
        </div>

        <div className="mt-5 sm:mt-6 space-y-2 sm:space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#183028]">
            {title}
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed sm:leading-6 text-[#5E665F]">
            {description}
          </p>
        </div>

        <div className="mt-5 sm:mt-6 grid gap-2 sm:gap-2.5 text-xs sm:text-sm font-medium text-[#183028]">
          {bullets.map((bullet) => (
            <div key={bullet} className="flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-sm">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#0F4D3F]" />
              <span className="text-xs sm:text-sm font-medium text-[#183028] truncate">{bullet}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0F4D3F] mt-auto">
          <span>Explore</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
  );
}

export default function MyRegistrationsPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/login");
      return;
    }

    if (role === "admin" || role === "organizer") {
      router.push("/events");
      return;
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-[#FAF8F4] py-6 sm:py-8">
      <div className="mx-auto max-w-[1490px] px-4 sm:px-6">
        {/* HERO CARD HEADER */}
        <div className="rounded-[24px] sm:rounded-[32px] border border-[#E8E1D5] bg-white p-5 sm:p-8 md:p-12 shadow-[0_16px_40px_rgba(24,48,40,0.06)]">
          <div className="max-w-4xl space-y-4 sm:space-y-6">
            <span className="inline-flex rounded-full border border-[#E8E1D5] bg-[#FAF8F4] px-3.5 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0F4D3F]">
              My Registrations
            </span>

            {/* 🌟 FIXED RESPONSIVE HEADER CLASSES */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[4rem] leading-[1.15] lg:leading-[0.92] tracking-[-0.03em] lg:tracking-[-0.05em] text-[#183028]">
              Your passes and event registrations, elevated.
            </h1>

            <p className="max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed sm:leading-7 text-[#5E665F]">
              Choose how you want to manage your tickets and team access, with quick access to event passes, attendance status, and registration details.
            </p>
          </div>
        </div>

        {/* CONTAINER TILES */}
        <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 md:grid-cols-2">
          <OptionCard
            index={0}
            href="/my-registrations/individual"
            icon={<CalendarDays className="h-5 w-5 sm:h-6 sm:w-6" />}
            title="Individual Registrations"
            description="Access your personal event registrations, QR passes, attendance history and payment information."
            bullets={["Digital QR Pass", "Attendance Status", "Payment History"]}
          />

          <OptionCard
            index={1}
            href="/my-registrations/team"
            icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />}
            title="Team Registrations"
            description="Manage team registrations, team members, captain details and shared event passes."
            bullets={["Team Pass", "Manage Members", "Captain Details"]}
          />
        </div>
      </div>
    </main>
  );
}