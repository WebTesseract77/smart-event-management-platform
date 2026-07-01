"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Users, Ticket, CheckCircle2 } from "lucide-react";

function OptionCard({ href, icon, title, description, bullets, accent, index }: any) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      className="h-full"
    >
      <Link
        href={href}
        className={`group block h-full rounded-3xl border bg-gradient-to-br ${accent} p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10`}
      >
        <div className="flex h-full flex-col">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-background/80 text-violet-600 shadow-sm ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105">
            {icon}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
          <ul className="mt-6 space-y-2 text-sm font-medium text-slate-950 dark:text-white">
            {bullets.map((bullet: string) => (
              <li key={bullet} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-600" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </motion.div>
  );
}

export default function MyRegistrationsPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_80%_24%,rgba(59,130,246,0.10),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.08),transparent_26%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_80%_24%,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.10),transparent_26%)]" />

        <motion.div
          className="mx-auto max-w-6xl px-6 py-16 lg:py-20"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm">
              <Ticket className="h-4 w-4 text-violet-600" />
              My Registrations
            </div>
            <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl">My Registrations</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Choose the registration type you want to manage.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            <OptionCard
              index={0}
              href="/my-registrations/individual"
              icon={<CalendarDays className="h-7 w-7" />}
              title="Individual Registrations"
              description="View your individual event registrations and digital passes."
              bullets={["QR Pass", "Attendance", "Payment Status"]}
              accent="from-violet-50 to-white dark:from-violet-500/10 dark:to-background"
            />
            <OptionCard
              index={1}
              href="/my-registrations/team"
              icon={<Users className="h-7 w-7" />}
              title="Team Registrations"
              description="Manage your team registrations and team passes."
              bullets={["Team Pass", "Team Members", "Captain Details"]}
              accent="from-sky-50 to-white dark:from-sky-500/10 dark:to-background"
            />
          </div>
        </motion.div>
      </div>
    </main>
  );
}
