"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, Variants } from "framer-motion";
import { toast } from "sonner";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CalendarDays,
  CalendarX2,
  CircleDollarSign,
  Clock,
  Inbox,
  LayoutDashboard,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  PlusCircle,
  ShieldCheck,
  TicketCheck,
  TrendingUp,
  UserCheck,
  UserRoundCheck,
  Users,
  UserX,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getAnalytics, getCurrentUser } from "@/lib/api";

type Metric = { month: string; value: number };
type Analytics = {
  total_users: number;
  total_organizers: number;
  total_admins: number;
  total_events: number;
  upcoming_events: number;
  completed_events: number;
  total_registrations: number;
  todays_registrations: number;
  attendance_rate: number;
  total_revenue: number;
  cancelled_events: number | null;
  monthly_events: Metric[];
  monthly_registrations: Metric[];
  monthly_revenue: Metric[];
  category_distribution: Metric[];
  categories_available: boolean;
  top_events: Array<{
    id: number;
    title: string;
    organizer?: string;
    registrations: number;
    attendance_rate: number;
    start_date: string;
  }>;
  top_organizers: Array<{
    id: number;
    name: string;
    events_created: number;
    total_registrations: number;
    average_attendance: number;
  }>;
  recent_activity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    occurred_at: string;
  }>;
};

const periods = [
  ["today", "Today"],
  ["7d", "7 Days"],
  ["30d", "30 Days"],
  ["90d", "90 Days"],
  ["year", "This Year"],
  ["custom", "Custom"],
] as const;

// --- Helper Functions ---

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
  if (diffInSeconds < 172800) return "Yesterday";
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

function getTimelineIcon(type: string) {
  switch (type.toLowerCase()) {
    case "event_created":
      return <PlusCircle className="h-4 w-4 text-[#0F4D3F]" />;
    case "registration":
      return <TicketCheck className="h-4 w-4 text-[#C6922F]" />;
    case "attendance":
      return <UserCheck className="h-4 w-4 text-[#2E8B57]" />;
    case "organizer_approved":
      return <ShieldCheck className="h-4 w-4 text-[#0F4D3F]" />;
    case "organizer_revoked":
      return <UserX className="h-4 w-4 text-red-600" />;
    case "revenue":
      return <CircleDollarSign className="h-4 w-4 text-[#C6922F]" />;
    case "system":
      return <Activity className="h-4 w-4 text-[#5E665F]" />;
    default:
      return <Clock className="h-4 w-4 text-[#5E665F]" />;
  }
}

// --- UI Components ---

function PremiumEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center space-y-4 rounded-2xl border border-dashed border-[#E8E1D5] bg-[#F9F8F6]/50 p-8 text-center transition-colors hover:bg-[#F9F8F6]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F2EA] text-[#0F4D3F]">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-medium text-[#183028]">{title}</h3>
        <p className="mt-1 text-sm text-[#5E665F] max-w-[250px] mx-auto">{description}</p>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[#E8E1D5] bg-white p-3 shadow-[0_12px_32px_rgba(15,77,63,0.08)]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#5E665F]">{label}</p>
        {payload.map((p: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
            <span className="text-sm font-medium text-[#183028]">
              {p.name === "value" ? p.value : `${p.name}: ${p.value}`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- Skeletons ---

function MetricCardSkeleton() {
  return (
    <div className="flex h-[180px] flex-col justify-between rounded-[24px] border border-[#E8E1D5] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 animate-pulse rounded-2xl bg-[#F5F2EA]" />
        <div className="h-4 w-16 animate-pulse rounded-full bg-[#F5F2EA]" />
      </div>
      <div className="space-y-3">
        <div className="h-3 w-24 animate-pulse rounded-full bg-[#E8E1D5]" />
        <div className="h-8 w-32 animate-pulse rounded-full bg-[#E8E1D5]" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-[380px] flex-col rounded-[24px] border border-[#E8E1D5] bg-white p-6 shadow-sm">
      <div className="h-5 w-40 animate-pulse rounded-full bg-[#E8E1D5] mb-8" />
      <div className="flex-1 animate-pulse rounded-xl bg-[#F5F2EA]/50" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-8">
      <div className="h-[200px] animate-pulse rounded-[32px] border border-[#E8E1D5] bg-white" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <ChartSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// --- Main Dashboard Component ---
// Fully self-contained: owns auth verification, analytics fetching, loading
// state, filters, and rendering. Renders with no props.

export default function AdminDashboard() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [period, setPeriod] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const currentToken = token;
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const user = await getCurrentUser(currentToken);
        if (user.role !== "admin") {
          router.push(user.role === "organizer" ? "/dashboard" : "/events");
          return;
        }
        const data = await getAnalytics(currentToken, {
          period,
          startDate: period === "custom" && customStart ? new Date(`${customStart}T00:00:00`).toISOString() : undefined,
          endDate: period === "custom" && customEnd ? new Date(`${customEnd}T23:59:59`).toISOString() : undefined,
        });
        if (active) setAnalytics(data);
      } catch (error) {
        console.error(error);
        if (active) toast.error("Failed to load platform analytics");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [customEnd, customStart, period, router]);

  const money = useMemo(() => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }), []);

  const chartAxis = { fontSize: 11, fill: "#5E665F", fontWeight: 500 };
  const chartGrid = <CartesianGrid vertical={false} stroke="#E8E1D5" strokeDasharray="4 4" opacity={0.5} />;

  // Animation variants
  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  if (loading && !analytics) return <DashboardSkeleton />;

  return (
    <motion.div
      initial={reduceMotion ? false : "hidden"}
      animate="show"
      variants={staggerContainer}
      className="space-y-8 pb-8 font-sans"
    >
      {/* Header & Filters */}
      <motion.section
        variants={fadeUp}
        className="relative overflow-hidden rounded-[32px] border border-[#E8E1D5] bg-white p-7 shadow-[0_4px_24px_rgba(15,77,63,0.02)] sm:p-10"
      >
        <div className="absolute right-0 top-0 -z-10 h-full w-1/2 bg-gradient-to-l from-[#F5F2EA]/40 to-transparent" />

        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#F5F2EA] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#0F4D3F]">
              <Activity className="h-3.5 w-3.5" /> Platform Intelligence
            </p>
            <h1 className="mt-5 font-serif text-4xl font-bold tracking-tight text-[#183028] sm:text-5xl">
              Overview
            </h1>
            <p className="mt-3 text-[#5E665F] leading-relaxed">
              Real-time platform performance across users, events, registrations, and revenue.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="inline-flex rounded-full border border-[#E8E1D5] bg-[#F5F2EA]/50 p-1 shadow-sm overflow-x-auto no-scrollbar">
              {periods.map(([key, label]) => {
                const isActive = period === key;
                return (
                  <button
                    key={key}
                    onClick={() => setPeriod(key)}
                    className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive ? "text-[#0F4D3F]" : "text-[#5E665F] hover:text-[#183028]"
                    }`}
                  >
                    {isActive && !reduceMotion && (
                      <motion.div
                        layoutId="active-period"
                        className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgba(15,77,63,0.08)]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {isActive && reduceMotion && (
                      <div className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgba(15,77,63,0.08)]" />
                    )}
                    <span className="relative z-10">{label}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {period === "custom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="flex flex-wrap gap-3 overflow-hidden rounded-2xl border border-[#E8E1D5] bg-white p-3 shadow-sm"
                >
                  <div className="flex flex-1 flex-col gap-1.5 min-w-[140px]">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#5E665F] px-1">Start Date</label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="h-9 w-full rounded-lg border border-[#E8E1D5] bg-[#F9F8F6] px-3 text-sm text-[#183028] outline-none focus:border-[#0F4D3F] focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 min-w-[140px]">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#5E665F] px-1">End Date</label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="h-9 w-full rounded-lg border border-[#E8E1D5] bg-[#F9F8F6] px-3 text-sm text-[#183028] outline-none focus:border-[#0F4D3F] focus:bg-white transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* Metric Cards */}
      <motion.section variants={staggerContainer} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: Users,
            label: "Total Users",
            value: analytics?.total_users ?? 0,
            detail: `${analytics?.total_admins ?? 0} administrators`,
          },
          {
            icon: UserRoundCheck,
            label: "Organizers",
            value: analytics?.total_organizers ?? 0,
            detail: "Active organizer accounts",
          },
          {
            icon: CalendarDays,
            label: "Total Events",
            value: analytics?.total_events ?? 0,
            detail: `${analytics?.upcoming_events ?? 0} upcoming in range`,
          },
          {
            icon: TicketCheck,
            label: "Registrations",
            value: analytics?.total_registrations ?? 0,
            detail: `${analytics?.todays_registrations ?? 0} registered today`,
          },
          {
            icon: TrendingUp,
            label: "Attendance Rate",
            value: `${analytics?.attendance_rate ?? 0}%`,
            detail: "Recorded average attendance",
          },
          {
            icon: CircleDollarSign,
            label: "Net Revenue",
            value: `₹${money.format(analytics?.total_revenue ?? 0)}`,
            detail: "Verified paid registrations",
          },
          {
            icon: ShieldCheck,
            label: "Completed",
            value: analytics?.completed_events ?? 0,
            detail: analytics?.cancelled_events === null ? "Cancellation history N/A" : `${analytics?.cancelled_events} cancelled`,
          },
          {
            icon: BarChart3,
            label: "Upcoming",
            value: analytics?.upcoming_events ?? 0,
            detail: "Scheduled in selected range",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#E8E1D5] bg-white p-6 shadow-[0_2px_12px_rgba(15,77,63,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D6CFB4] hover:shadow-[0_8px_24px_rgba(15,77,63,0.06)]"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-2xl border border-[#E8E1D5]/60 bg-[#F5F2EA]/80 p-3 text-[#0F4D3F] transition-colors group-hover:bg-[#F5F2EA]">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E665F]">{stat.label}</p>
              <p className="mt-1 font-serif text-3xl font-semibold text-[#183028]">{stat.value}</p>
              <p className="mt-2 text-sm text-[#5E665F]">{stat.detail}</p>
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* Charts */}
      <motion.section variants={staggerContainer} className="grid gap-6 xl:grid-cols-2">
        <motion.div variants={fadeUp} className="rounded-[28px] border border-[#E8E1D5] bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,77,63,0.02)] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold text-[#183028]">Monthly Registrations</h2>
            <BarChart3 className="h-5 w-5 text-[#5E665F]" />
          </div>
          <div className="h-[300px] w-full">
            {analytics?.monthly_registrations?.some((item) => item.value) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthly_registrations} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  {chartGrid}
                  <XAxis dataKey="month" tick={chartAxis} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={chartAxis} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#F5F2EA', opacity: 0.4 }} content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#0F4D3F" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {analytics.monthly_registrations.map((entry, index) => (
                      <Cell key={`cell-${index}`} className="transition-all duration-300 hover:opacity-80" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <PremiumEmptyState icon={BarChart3} title="No Registration Data" description="There are no registrations recorded for this time period." />
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-[28px] border border-[#E8E1D5] bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,77,63,0.02)] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold text-[#183028]">Monthly Revenue</h2>
            <LineChartIcon className="h-5 w-5 text-[#5E665F]" />
          </div>
          <div className="h-[300px] w-full">
            {analytics?.monthly_revenue?.some((item) => item.value) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthly_revenue} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C6922F" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#C6922F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {chartGrid}
                  <XAxis dataKey="month" tick={chartAxis} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={chartAxis} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#C6922F"
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#C6922F" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <PremiumEmptyState icon={CircleDollarSign} title="No Revenue Data" description="No paid registrations have been recorded for the selected period." />
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-[28px] border border-[#E8E1D5] bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,77,63,0.02)] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold text-[#183028]">Scheduled Events</h2>
            <CalendarDays className="h-5 w-5 text-[#5E665F]" />
          </div>
          <div className="h-[300px] w-full">
            {analytics?.monthly_events?.some((item) => item.value) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthly_events} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  {chartGrid}
                  <XAxis dataKey="month" tick={chartAxis} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={chartAxis} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0F4D3F"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#0F4D3F", strokeWidth: 0 }}
                    activeDot={{ r: 7, strokeWidth: 0, fill: "#0F4D3F" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <PremiumEmptyState icon={CalendarX2} title="No Scheduled Events" description="No scheduled events are available for this period." />
            )}
          </div>
        </motion.div>

        {analytics?.categories_available && (
          <motion.div variants={fadeUp} className="rounded-[28px] border border-[#E8E1D5] bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,77,63,0.02)] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold text-[#183028]">Event Categories</h2>
              <PieChartIcon className="h-5 w-5 text-[#5E665F]" />
            </div>
            <div className="h-[300px] w-full">
              {analytics.category_distribution?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.category_distribution}
                      dataKey="value"
                      nameKey="month" // Using month as nameKey per original implementation
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {analytics.category_distribution.map((_, i) => (
                        <Cell key={i} fill={["#0F4D3F", "#C6922F", "#2E8B57", "#9DAA9F"][i % 4]} className="transition-all duration-300 hover:opacity-80 cursor-pointer" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <PremiumEmptyState icon={PieChartIcon} title="No Category Data" description="No events have been assigned a category for the selected period." />
              )}
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* Tables */}
      <motion.section variants={staggerContainer} className="grid gap-6 xl:grid-cols-2">
        <motion.div variants={fadeUp} className="flex flex-col rounded-[28px] border border-[#E8E1D5] bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,77,63,0.02)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#183028]">Top Events</h2>
            <span className="text-sm text-[#5E665F]">By Registration</span>
          </div>

          {analytics?.top_events?.length ? (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="border-b border-[#E8E1D5]">
                    <tr>
                      <th className="pb-4 font-semibold text-[#5E665F]">Event Details</th>
                      <th className="pb-4 font-semibold text-[#5E665F]">Organizer</th>
                      <th className="pb-4 font-semibold text-[#5E665F] text-right">Registrations</th>
                      <th className="pb-4 font-semibold text-[#5E665F] text-right">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E1D5]/60">
                    {analytics.top_events.map((event) => (
                      <tr key={event.id} className="group transition-colors hover:bg-[#F9F8F6]">
                        <td className="py-4 pr-4">
                          <p className="font-medium text-[#183028]">{event.title}</p>
                          <p className="mt-1 text-xs text-[#5E665F] flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {new Date(event.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="py-4 pr-4 text-[#5E665F]">
                          <span className="inline-flex items-center rounded-full bg-[#F5F2EA] px-2.5 py-1 text-xs font-medium text-[#183028]">
                            {event.organizer || "Unassigned"}
                          </span>
                        </td>
                        <td className="py-4 text-right font-medium text-[#183028]">{event.registrations}</td>
                        <td className="py-4 text-right">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            event.attendance_rate >= 80 ? 'bg-green-100 text-green-800' :
                            event.attendance_rate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {event.attendance_rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-4">
                {analytics.top_events.map((event) => (
                  <div key={event.id} className="rounded-xl border border-[#E8E1D5] p-4 bg-[#F9F8F6]/50">
                    <p className="font-medium text-[#183028]">{event.title}</p>
                    <p className="mt-1 text-xs text-[#5E665F] mb-4">
                      {new Date(event.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E8E1D5]/60 text-sm">
                      <div>
                        <p className="text-[#5E665F] text-xs mb-1">Registrations</p>
                        <p className="font-medium text-[#183028]">{event.registrations}</p>
                      </div>
                      <div>
                        <p className="text-[#5E665F] text-xs mb-1">Attendance</p>
                        <p className="font-medium text-[#183028]">{event.attendance_rate}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <PremiumEmptyState icon={Inbox} title="No Top Events" description="No event data is available to display for this period." />
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-col rounded-[28px] border border-[#E8E1D5] bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,77,63,0.02)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#183028]">Most Active Organizers</h2>
            <span className="text-sm text-[#5E665F]">By Events Created</span>
          </div>

          {analytics?.top_organizers?.length ? (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="border-b border-[#E8E1D5]">
                    <tr>
                      <th className="pb-4 font-semibold text-[#5E665F]">Organizer</th>
                      <th className="pb-4 font-semibold text-[#5E665F] text-right">Events</th>
                      <th className="pb-4 font-semibold text-[#5E665F] text-right">Total Reg.</th>
                      <th className="pb-4 font-semibold text-[#5E665F] text-right">Avg. Attend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E1D5]/60">
                    {analytics.top_organizers.map((person) => (
                      <tr key={person.id} className="group transition-colors hover:bg-[#F9F8F6]">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-[#F5F2EA] flex items-center justify-center text-[#0F4D3F] font-medium text-xs">
                              {person.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-[#183028]">{person.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right font-medium text-[#183028]">{person.events_created}</td>
                        <td className="py-4 text-right text-[#5E665F]">{person.total_registrations}</td>
                        <td className="py-4 text-right text-[#5E665F]">{person.average_attendance}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-4">
                {analytics.top_organizers.map((person) => (
                  <div key={person.id} className="rounded-xl border border-[#E8E1D5] p-4 bg-[#F9F8F6]/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-[#F5F2EA] flex items-center justify-center text-[#0F4D3F] font-medium text-sm">
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-medium text-[#183028]">{person.name}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E8E1D5]/60 text-sm">
                      <div>
                        <p className="text-[#5E665F] text-xs mb-1">Events</p>
                        <p className="font-medium text-[#183028]">{person.events_created}</p>
                      </div>
                      <div>
                        <p className="text-[#5E665F] text-xs mb-1">Regs.</p>
                        <p className="font-medium text-[#183028]">{person.total_registrations}</p>
                      </div>
                      <div>
                        <p className="text-[#5E665F] text-xs mb-1">Attend.</p>
                        <p className="font-medium text-[#183028]">{person.average_attendance}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <PremiumEmptyState icon={UserX} title="No Organizer Data" description="There are no active organizers with events in this period." />
          )}
        </motion.div>
      </motion.section>

      {/* Activity Timeline */}
      <motion.section variants={fadeUp} className="rounded-[28px] border border-[#E8E1D5] bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,77,63,0.02)]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-semibold text-[#183028]">Recent Activity</h2>
          <LayoutDashboard className="h-5 w-5 text-[#5E665F]" />
        </div>

        {analytics?.recent_activity?.length ? (
          <div className="relative pl-3">
            {/* Vertical timeline line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-px bg-[#E8E1D5]" />

            <div className="space-y-6 relative">
              {analytics.recent_activity.map((item, index) => (
                <div key={item.id} className="group flex gap-5">
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[#F5F2EA] shadow-sm transition-transform group-hover:scale-110">
                    {getTimelineIcon(item.type)}
                  </div>
                  <div className="flex flex-1 flex-col sm:flex-row sm:items-start sm:justify-between gap-2 pt-1">
                    <div>
                      <p className="font-medium text-[#183028] leading-tight">{item.title}</p>
                      <p className="mt-1 text-sm text-[#5E665F]">{item.description}</p>
                    </div>
                    <div className="group relative">
                      <time className="shrink-0 text-xs font-medium text-[#5E665F]/80 uppercase tracking-wider bg-[#F9F8F6] px-2.5 py-1 rounded-full whitespace-nowrap">
                        {getRelativeTime(item.occurred_at)}
                      </time>
                      <div className="absolute right-0 -top-8 hidden rounded-md bg-[#183028] px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap shadow-md z-20">
                        {new Date(item.occurred_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <PremiumEmptyState icon={AlertCircle} title="No Recent Activity" description="There has been no administrative activity logged for this period." />
        )}
      </motion.section>
    </motion.div>
  );
}