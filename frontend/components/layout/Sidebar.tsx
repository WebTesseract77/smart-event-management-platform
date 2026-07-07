"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  PlusSquare,
  Users,
  UserCircle,
  LogOut,
  TicketCheck,
  ClipboardList,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

type MenuItem = {
  title: string;
  href: string;
  icon: any;
};

const dashboard: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Events",
    href: "/events",
    icon: CalendarDays,
  },
];

const myRegistration = {
  title: "My Registrations",
  href: "/my-registrations",
  icon: TicketCheck,
};

const users = {
  title: "Users",
  href: "/admin/users",
  icon: Users,
};

const createEvent = {
  title: "Create Event",
  href: "/create-event",
  icon: PlusSquare,
};

const myEvents = {
  title: "My Events",
  href: "/organizer/events",
  icon: ClipboardList,
};

const profile = {
  title: "Profile",
  href: "/profile",
  icon: UserCircle,
};

type SidebarProps = {
  open: boolean;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  onClose: () => void;
};

export default function Sidebar({
  open,
  collapsed,
  setCollapsed,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const savedRole =
      localStorage.getItem("role") || localStorage.getItem("userRole");

    if (savedRole) {
      setRole(savedRole.toLowerCase());
    }
  }, []);

  const menu: MenuItem[] = [
    ...dashboard,
    // NORMAL USER ONLY
    ...(role === "participant" || role === "user" ? [myRegistration] : []),
    // ADMIN ONLY
    ...(role === "admin" ? [users] : []),
    // ORGANIZER ONLY
    ...(role === "organizer" ? [myEvents, createEvent] : []),
    profile,
  ];

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userRole");
    router.push("/login");
  }

  return (
    <>
      {open && (
        <button
          onClick={onClose}
          className="fixed inset-0 z-30 bg-[#183028]/20 xl:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#E8E1D5] bg-[#FAF8F4] shadow-lg transition-all duration-300 ease-in-out",
          collapsed ? "w-[280px] xl:w-[88px]" : "w-[280px]",
          open ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        )}
      >
        {/* LOGO & CLAUDE TOGGLE AREA */}
        <div
          className={cn(
            "flex h-[88px] items-center border-b border-[#E8E1D5] px-5 transition-all duration-300",
            collapsed ? "xl:justify-center xl:px-0" : "justify-between"
          )}
        >
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 transition-all duration-200",
              collapsed && "xl:pointer-events-none xl:max-w-0 xl:opacity-0 xl:overflow-hidden"
            )}
          >
            <div className="whitespace-nowrap">
              <h1 className="text-[18px] font-bold">
                <span className="text-[#0F4D3F]">Event</span>
                <span className="text-[#C6922F]">Sphere</span>
              </h1>
              <p className="text-xs text-[#C6922F]">
                Events. Seamless. Everywhere.
              </p>
            </div>
          </Link>

          {/* Minimal Claude Toggle Button */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden h-8 w-8 items-center justify-center rounded text-[#5E665F] hover:bg-[#F5F2EA] hover:text-[#0F4D3F] transition-colors xl:flex"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* LINKS */}
        <nav className="flex-1 space-y-3 px-4 py-5">
          {menu.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-[50px] items-center rounded-[16px] px-4 transition-all duration-300",
                  collapsed ? "gap-3 xl:justify-center xl:gap-0" : "gap-3",
                  active
                    ? "bg-[#0F4D3F] text-white shadow-lg"
                    : "text-[#5E665F] hover:bg-[#F5F2EA]"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />

                <span
                  className={cn(
                    "font-medium transition-all duration-200 whitespace-nowrap",
                    collapsed
                      ? "xl:max-w-0 xl:opacity-0 xl:overflow-hidden"
                      : "xl:max-w-full xl:opacity-100"
                  )}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="border-t border-[#E8E1D5] p-4">
          <button
            onClick={handleLogout}
            className={cn(
              "flex h-[50px] w-full items-center rounded-[16px] px-4 text-[#5E665F] hover:bg-[#0F4D3F] hover:text-white transition-all duration-300",
              collapsed ? "gap-3 xl:justify-center xl:gap-0" : "gap-3"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />

            <span
              className={cn(
                "transition-all duration-200 whitespace-nowrap",
                collapsed
                  ? "xl:max-w-0 xl:opacity-0 xl:overflow-hidden"
                  : "xl:max-w-full xl:opacity-100"
              )}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}