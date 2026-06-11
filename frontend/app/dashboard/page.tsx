"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getEvents,
  getMyRegistrations,
  getCurrentUser,
} from "@/lib/api";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Calendar,
  Ticket,
  User,
  Plus,
  ArrowRight,
  QrCode,
} from "lucide-react";

export default function Dashboard() {
  const [eventCount, setEventCount] =
    useState(0);

  const [
    registrationCount,
    setRegistrationCount,
  ] = useState(0);

  const [isAdmin, setIsAdmin] =
    useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const events =
          await getEvents();

        setEventCount(
          Array.isArray(events)
            ? events.length
            : 0
        );

        const token =
          localStorage.getItem(
            "token"
          );

        if (token) {
          const registrations =
            await getMyRegistrations(
              token
            );

          setRegistrationCount(
            Array.isArray(
              registrations
            )
              ? registrations.length
              : 0
          );

          const user =
            await getCurrentUser(
              token
            );

          setIsAdmin(
            user.role === "admin"
          );
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-5xl font-bold">
            Dashboard
          </h1>

          <p className="text-muted-foreground text-lg mt-3">
            Welcome back to Smart Event
            Management Platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">
                    Total Events
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {eventCount}
                  </h2>
                </div>

                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">
                    My Registrations
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {registrationCount}
                  </h2>
                </div>

                <Ticket className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">
                    Account Status
                  </p>

                  <h2 className="text-2xl font-bold mt-2">
                    Active
                  </h2>
                </div>

                <User className="w-8 h-8 text-violet-600" />
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">

          {isAdmin && (
            <Link href="/create-event">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">

                  <Plus className="w-8 h-8 mb-4" />

                  <h3 className="font-bold text-lg">
                    Create Event
                  </h3>

                  <p className="text-sm text-muted-foreground mt-2">
                    Organize a new event.
                  </p>

                </CardContent>
              </Card>
            </Link>
          )}

          <Link href="/events">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">

                <Calendar className="w-8 h-8 mb-4" />

                <h3 className="font-bold text-lg">
                  Browse Events
                </h3>

                <p className="text-sm text-muted-foreground mt-2">
                  Discover upcoming events.
                </p>

              </CardContent>
            </Card>
          </Link>

          <Link href="/my-registrations">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">

                <Ticket className="w-8 h-8 mb-4" />

                <h3 className="font-bold text-lg">
                  My Passes
                </h3>

                <p className="text-sm text-muted-foreground mt-2">
                  View your registrations.
                </p>

              </CardContent>
            </Card>
          </Link>

          {isAdmin && (
            <Link href="/scanner">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">

                  <QrCode className="w-8 h-8 mb-4" />

                  <h3 className="font-bold text-lg">
                    Scanner
                  </h3>

                  <p className="text-sm text-muted-foreground mt-2">
                    Verify attendee QR passes.
                  </p>

                </CardContent>
              </Card>
            </Link>
          )}

          <Link href="/profile">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">

                <User className="w-8 h-8 mb-4" />

                <h3 className="font-bold text-lg">
                  Profile
                </h3>

                <p className="text-sm text-muted-foreground mt-2">
                  Manage your account.
                </p>

              </CardContent>
            </Card>
          </Link>

        </div>

        <Card>
          <CardContent className="p-8">

            <h2 className="text-2xl font-bold">
              Platform Overview
            </h2>

            <p className="text-muted-foreground mt-3">
              Manage events, register attendees,
              generate QR-based event passes,
              and track attendance from a
              single platform.
            </p>

            <Link href="/events">
              <Button className="mt-6">
                Explore Events
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}