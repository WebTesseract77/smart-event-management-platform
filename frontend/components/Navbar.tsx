"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getCurrentUser } from "@/lib/api";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

const ROLE_NAV: Record<string, NavItem[]> = {
  admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/events", label: "Events" },
    { href: "/my-registrations", label: "My Registrations" },
    { href: "/admin/users", label: "Users" },
    { href: "/create-event", label: "Create Event" },
    { href: "/scanner", label: "Scanner" },
    { href: "/profile", label: "Profile" },
  ],
  organizer: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/organizer/events", label: "My Events" },
    { href: "/organizer/analytics", label: "Analytics" },
    { href: "/create-event", label: "Create Event" },
    { href: "/events", label: "Participants" },
    { href: "/scanner", label: "Attendance" },
    { href: "/profile", label: "Profile" },
  ],
  user: [
    { href: "/events", label: "Events" },
    { href: "/my-registrations", label: "My Registrations" },
    { href: "/profile", label: "Profile" },
  ],
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("user");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoggedIn(false);
        return;
      }

      try {
        const user = await getCurrentUser(token);
        setLoggedIn(true);
        setRole(user.role || "user");
      } catch {
        setLoggedIn(false);
      }
    }

    loadUser();
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  const navItems = useMemo(() => {
    if (!loggedIn) {
      return [{ href: "/events", label: "Events" }];
    }

    return ROLE_NAV[role] || ROLE_NAV.user;
  }, [loggedIn, role]);

  function isActive(href: string) {
    if (href === "/events") {
      return pathname === "/events" || pathname.startsWith("/events/");
    }

    if (href === "/create-event") {
      return pathname === "/create-event" || pathname.startsWith("/create-event/");
    }

    if (href === "/admin/users") {
      return pathname === "/admin/users";
    }

    if (href === "/my-registrations") {
      return pathname === "/my-registrations" || pathname.startsWith("/my-registrations/");
    }

    if (href === "/organizer/events") {
      return pathname === "/organizer/events" || pathname.startsWith("/organizer/events/");
    }

    if (href === "/organizer/analytics") {
      return pathname === "/organizer/analytics" || pathname.startsWith("/organizer/analytics/");
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md transition-shadow",
        scrolled && "shadow-[0_12px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_12px_32px_rgba(2,6,23,0.35)]"
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl px-1 py-1 text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent md:text-2xl"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
              E
            </span>
            EventSphere
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-muted hover:text-foreground",
                isActive(item.href)
                  ? "bg-violet-100 text-violet-700 shadow-sm dark:bg-violet-500/15 dark:text-violet-200"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <ThemeToggle />

          {!loggedIn ? (
            <>
              <Link href="/register">
                <Button variant="outline" className="rounded-full px-4">
                  Register
                </Button>
              </Link>

              <Link href="/login">
                <Button className="rounded-full px-4">
                  Login
                </Button>
              </Link>
            </>
          ) : (
            <Button variant="destructive" onClick={logout} className="rounded-full px-4">
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
