"use client";
import { clearAttendance } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Activity, CheckCircle2, Clock3, Users, Download } from "lucide-react";

import {
  getCurrentUser,
  getOrganizerEventAttendance,
  getOrganizerEvents,
} from "@/lib/api";
import { exportToCSV } from "@/lib/exportCsv";
import { AttendanceScanner } from "@/components/app/AttendanceScanner";
import { EmptyState, PageHeaderSkeleton } from "@/components/app/FeedbackStates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrganizerAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        const currentUser = await getCurrentUser(currentToken!);

        if (currentUser.role !== "organizer") {
          window.alert("Access denied.");
          router.push("/events");
          return;
        }

        const events = await getOrganizerEvents(currentToken!);
        const selectedEvent = events.find((item: any) => item.id === eventId);

        if (!selectedEvent) {
          setEvent(null);
          setAttendance([]);
          return;
        }

        setEvent(selectedEvent);

        const attendanceData = await getOrganizerEventAttendance(currentToken!, eventId);
        setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventId, router]);

  const checkedInCount = attendance.length;

  async function refreshAttendance() {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return;

    try {
      const attendanceData = await getOrganizerEventAttendance(currentToken, eventId);
      setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
    } catch (error) {
      console.error(error);
    }
  }

  const handleExport = () => {
    if (attendance.length === 0) {
      toast.error("No data available to export");
      return;
    }
    const data = attendance.map((a) => ({
      "Name": a.user_name,
      "Email": a.user_email,
      "Event ID": a.event_id,
      "Checked In Time": new Date(a.recorded_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    }));
    const fileName = event ? `${event.title.toLowerCase().replace(/ /g, "-")}-attendance` : "attendance-list";
    exportToCSV(fileName, data);
  };

  if (loading) {



    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:py-10">
          <div className="space-y-6">
            <PageHeaderSkeleton />
            <div className="grid gap-6 items-start lg:grid-cols-[600px_1fr]">
              <Card className="rounded-[24px] border border-[#E8E1D5] bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-10 w-64 rounded-full bg-[#E8E1D5]/50" />
                    <div className="h-[420px] rounded-[20px] bg-[#E8E1D5]/30" />
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-[24px] border border-[#E8E1D5] bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-10 w-48 rounded-full bg-[#E8E1D5]/50" />
                    <div className="h-8 w-full rounded-full bg-[#E8E1D5]/30" />
                  </div>
                  <div className="mt-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="h-14 rounded-[16px] bg-[#E8E1D5]/40" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <EmptyState
            icon={<Activity className="h-5 w-5" />}
            title="Event not found"
            description="This event may no longer exist or you may not have access to it."
            actionLabel="Back to My Events"
            actionHref="/organizer/events"
          />
        </div>
      </div>
    );
  }
async function handleClearAttendance() {
  if (
    !confirm(
      "Clear all attendance records for this event?"
    )
  ) {
    return;
  }

  try {
    const token = localStorage.getItem("token")!;

    await clearAttendance(
      token,
      Number(params.id)
    );

    toast.success("Attendance cleared");

await refreshAttendance();
  } catch (err) {
    toast.error("Failed to clear attendance");
  }
}
  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#183028]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:py-10">
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-[24px] border border-[#E8E1D5] bg-white shadow-sm">
            <CardContent className="p-6 sm:p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="mt-2 font-serif text-[3.2rem] leading-[0.92] tracking-[-0.05em] text-[#183028]">
                      {event.title}
                </h1>
                <p className="mt-2 text-base text-[#5E665F]">
                  Scan attendee QR codes and track live attendance.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F2EA] px-4 py-2 text-sm font-semibold text-[#0F4D3F]">
                  <Users className="h-4 w-4" />
                  {checkedInCount} checked in
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F2EA] px-4 py-2 text-sm font-semibold text-[#0F4D3F]">
                  <Clock3 className="h-4 w-4" />
                  {event.registered_count ?? 0} registered
                </div>
                <Button 
                  onClick={handleExport}
                  className="rounded-full bg-[#0F4D3F] px-4 text-white hover:bg-[#0F4D3F]/90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button
  variant="destructive"
  onClick={handleClearAttendance}
>
  Clear Attendance
</Button>
                <Link href="/organizer/events">
                  <Button variant="outline" className="rounded-full border-[#E8E1D5] text-[#183028] hover:bg-[#F5F2EA]">
                    Back to Events
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 items-start lg:grid-cols-[600px_1fr]">
            <AttendanceScanner
              mode="organizer"
              eventId={eventId}
              onRecorded={refreshAttendance}
            />

            <Card className="rounded-[24px] border border-[#E8E1D5] bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-[#183028]">Attendance list</h2>
                    <p className="mt-1 text-sm text-[#5E665F]">
                      Live check-ins recorded for this event.
                    </p>
                  </div>
                  <Badge className="rounded-full bg-[#F5F2EA] px-3 py-1 text-xs text-[#0F4D3F] border-none">
                    {checkedInCount} total
                  </Badge>
                </div>

                <div className="mt-6 overflow-hidden rounded-[20px] border border-[#E8E1D5] bg-[#FAF8F4]">
                  {attendance.length === 0 ? (
                    <EmptyState
                      icon={<CheckCircle2 className="h-5 w-5 text-[#0F4D3F]" />}
                      title="No attendance yet"
                      description="Attendance will appear here as users scan their QR passes."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#E8E1D5] bg-[#F5F2EA] text-left">
                            <th className="p-4 text-sm font-semibold text-[#183028]">Name</th>
                            <th className="p-4 text-sm font-semibold text-[#183028]">Email</th>
                            <th className="p-4 text-sm font-semibold text-[#183028]">Checked In At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance.map((record) => (
                            <tr key={record.id} className="border-b border-[#E8E1D5] bg-white last:border-0">
                              <td className="p-4 text-sm font-medium text-[#183028]">{record.user_name}</td>
                              <td className="p-4 text-sm text-[#5E665F]">{record.user_email}</td>
                              <td className="p-4 text-sm text-[#5E665F]">
                                {formatDate(record.recorded_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}