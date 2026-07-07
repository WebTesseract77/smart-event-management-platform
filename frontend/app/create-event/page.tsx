"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Users, Ticket, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: index * 0.06,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  }),
};

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
      custom={index}
      variants={cardVariants}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="h-full"
    >
      <Link
        href={href}
        className="group block h-full rounded-[24px] border border-[#E8E1D5] bg-white p-8 shadow-[0_8px_24px_rgba(15,77,63,0.02)] transition-all duration-300 hover:border-[#0F4D3F] hover:bg-[#EAF3ED]/20 hover:shadow-[0_16px_32px_rgba(15,77,63,0.06)]"
      >
        <div className="flex h-full flex-col">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAF8F4] text-[#0F4D3F] border border-[#E8E1D5] transition-colors duration-300 group-hover:bg-white group-hover:border-[#0F4D3F]/20">
            {icon}
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-[#183028]">
            {title}
          </h2>

          <p className="mt-2.5 text-sm leading-6 text-[#5E665F] flex-grow">
            {description}
          </p>

          <div className="mt-6 pt-5 border-t border-[#E8E1D5]/60">
            <ul className="space-y-2.5 text-xs font-medium text-[#183028]">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0F4D3F]" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CreateEventPage() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();


  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role !== "organizer") {
      router.push("/events");
    }

  }, [router]);


  return (
    <main className="min-h-screen bg-[#FAF8F4] px-6 py-10 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Premium Header Card */}
        <motion.div
          className="rounded-[32px] border border-[#E8E1D5] bg-white p-8 md:p-10 shadow-[0_12px_32px_rgba(15,77,63,0.03)]"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E1D5] bg-[#FAF8F4] px-4 py-1.5 text-xs font-medium text-[#0F4D3F]">
              <Ticket className="h-3.5 w-3.5" />
              Create Event
            </div>

            <h1 className="mt-7 font-serif text-[3.2rem] leading-[0.92] tracking-[-0.05em] text-[#183028] sm:text-[4rem]">
               Create a new event
             </h1>

            <p className="mt-3 text-sm leading-6 text-[#5E665F]">
              Select whether you're creating an individual or team event. 
              Configure registrations, payments, attendance metrics, and everything else in the next step.
            </p>
          </div>
        </motion.div>

        {/* Event Type Selection Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <OptionCard
            index={0}
            href="/create-event/individual"
            icon={<CalendarDays className="h-5 w-5" />}
            title="Individual Event"
            description="Perfect for workshops, seminars, coding contests, and events where each participant registers individually."
            bullets={[
              "QR Pass Generation",
              "Individual Attendance Tracking",
              "Optional Payment Gateways",
            ]}
          />

          <OptionCard
            index={1}
            href="/create-event/team"
            icon={<Users className="h-5 w-5" />}
            title="Team Event"
            description="Ideal for hackathons, case study competitions, sports leagues, and collaborative events with team-based registrations."
            bullets={[
              "Custom Team Member Limits",
              "Team Captain Management Roles",
              "Unified Group QR Identification",
            ]}
          />
        </div>

      </div>
    </main>
  );
}