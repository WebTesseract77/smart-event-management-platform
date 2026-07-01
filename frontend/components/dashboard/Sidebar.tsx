"use client";
import Link from "next/link";
import React from "react";
import { Home, Calendar, Users, PlusSquare, QrCode, User, Settings, Menu } from "lucide-react";
import HelpCard from "@/components/dashboard/HelpCard";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  active?: boolean;
}

const nav: NavItem[] = [
  { label: "Dashboard", icon: Home, href: "/" },
  { label: "Events", icon: Calendar, href: "/events" },
  { label: "Users", icon: Users, href: "/admin/users", active: true },
  { label: "Create Event", icon: PlusSquare, href: "/create-event" },
  { label: "Scanner", icon: QrCode, href: "/scanner" },
  { label: "Profile", icon: User, href: "/profile" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-[280px] bg-[color:var(--sidebar)] min-h-screen flex flex-col px-6 py-8 gap-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[color:var(--primary)] flex items-center justify-center text-white font-semibold">E</div>
        <div>
          <div className="text-white font-semibold">EventSphere</div>
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.active ?? false;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-[14px] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--sidebar-ring)] ${
                    active
                      ? "bg-[color:var(--sidebar-primary)] text-[color:var(--sidebar-primary-foreground)]"
                      : "text-[color:var(--sidebar-foreground)] hover:bg-white/2"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-white" : "text-[color:var(--muted)] group-hover:text-white"}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div>
        <HelpCard />
      </div>
    </aside>
  );
}
