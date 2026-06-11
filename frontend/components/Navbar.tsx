"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getCurrentUser,
} from "@/lib/api";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [loggedIn, setLoggedIn] =
    useState(false);

  const [role, setRole] =
    useState("");

  useEffect(() => {
    async function loadUser() {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setLoggedIn(false);
        return;
      }

      try {
        const user =
          await getCurrentUser(
            token
          );

        setLoggedIn(true);

        setRole(
          user.role || "user"
        );
      } catch {
        setLoggedIn(false);
      }
    }

    loadUser();
  }, []);

  function logout() {
    localStorage.removeItem("token");

    window.location.href =
      "/login";
  }

  const canManageEvents =
    role === "admin" ||
    role === "organizer";

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 p-4">

        <div className="flex items-center gap-6 flex-wrap">

       <Link
  href="/"
  className="
    font-extrabold
    text-xl
    bg-gradient-to-r
    from-blue-600
    via-violet-600
    to-purple-600
    bg-clip-text
    text-transparent
  "
>
  EventSphere
</Link>

          <Link href="/events">
            Events
          </Link>

          {loggedIn && (
            <>
              <Link href="/dashboard">
                Dashboard
              </Link>

              <Link href="/my-registrations">
                My Registrations
              </Link>

              <Link href="/profile">
                Profile
              </Link>

              {canManageEvents && (
                <>
                  <Link href="/create-event">
                    Create Event
                  </Link>

                  <Link href="/scanner">
                    Scanner
                  </Link>
                </>
              )}
            </>
          )}

        </div>

        <div className="flex items-center gap-2">

          <ThemeToggle />

          {!loggedIn ? (
            <>
              <Link href="/register">
                <Button variant="outline">
                  Register
                </Button>
              </Link>

              <Link href="/login">
                <Button>
                  Login
                </Button>
              </Link>
            </>
          ) : (
            <Button
              variant="destructive"
              onClick={logout}
            >
              Logout
            </Button>
          )}

        </div>

      </div>
    </nav>
  );
}