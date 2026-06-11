"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/api";

import { Button } from "@/components/ui/button";

import {
  Ticket,
  CheckCircle2,
  Users,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const [isAdmin, setIsAdmin] =
    useState(false);

  useEffect(() => {
    async function loadUser() {
      const token =
        localStorage.getItem("token");

      if (!token) return;

      try {
        const user =
          await getCurrentUser(
            token
          );

        setIsAdmin(
          user.role === "admin"
        );
      } catch {}
    }

    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-10">

        <div className="text-center">

          <h1
            className="
              text-6xl
              md:text-8xl
              font-extrabold
              tracking-tight
            "
          >
            <span
              className="
                bg-gradient-to-r
                from-blue-600
                via-violet-600
                to-purple-600
                bg-clip-text
                text-transparent
              "
            >
              EventSphere
            </span>
          </h1>

          <p className="mt-4 text-2xl md:text-3xl font-semibold">
            Create. Manage. Attend.
          </p>

          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
            Organize events, manage registrations,
            issue digital QR passes, and track
            attendance from one modern platform.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-10">

            <Link href="/events">
              <Button size="lg">
                Browse Events
              </Button>
            </Link>

            {isAdmin && (
              <Link href="/create-event">
                <Button
                  size="lg"
                  variant="outline"
                >
                  Create Event
                </Button>
              </Link>
            )}

          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-14">

            <div
              className="
                rounded-xl
                border
                bg-background
                p-6
                text-center
                transition-all
                hover:-translate-y-1
                hover:shadow-lg
              "
            >
              <Ticket className="h-8 w-8 mx-auto mb-3 text-violet-600" />

              <p className="font-medium">
                Digital Passes
              </p>
            </div>

            <div
              className="
                rounded-xl
                border
                bg-background
                p-6
                text-center
                transition-all
                hover:-translate-y-1
                hover:shadow-lg
              "
            >
              <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-violet-600" />

              <p className="font-medium">
                Attendance Tracking
              </p>
            </div>

            <div
              className="
                rounded-xl
                border
                bg-background
                p-6
                text-center
                transition-all
                hover:-translate-y-1
                hover:shadow-lg
              "
            >
              <Users className="h-8 w-8 mx-auto mb-3 text-violet-600" />

              <p className="font-medium">
                Participant Management
              </p>
            </div>

            <div
              className="
                rounded-xl
                border
                bg-background
                p-6
                text-center
                transition-all
                hover:-translate-y-1
                hover:shadow-lg
              "
            >
              <Zap className="h-8 w-8 mx-auto mb-3 text-violet-600" />

              <p className="font-medium">
                Real-Time Registration
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t mt-16">

  <div className="max-w-6xl mx-auto px-6 py-8 text-center">

    <h3 className="text-xl font-bold">
      EventSphere
    </h3>

    <p className="text-sm text-muted-foreground mt-2">
      Create. Manage. Attend.
    </p>

    <p className="text-sm text-muted-foreground mt-4">
      © 2026 EventSphere
    </p>

  </div>

</footer>

    </div>
  );
}