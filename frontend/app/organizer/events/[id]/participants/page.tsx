"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, UserCheck, Clock, Ticket, Download } from "lucide-react";
import { toast } from "sonner";

import { getParticipants, getAttendance } from "@/lib/api";
import { exportToCSV } from "@/lib/exportCsv";
import { EmptyState, PageHeaderSkeleton } from "@/components/app/FeedbackStates";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ParticipantWithStatus = {
  id: number;
  name: string;
  email: string;
  ticket_type?: string;
  isCheckedIn: boolean;
  checkedInAt?: string;
};

export default function ParticipantsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<ParticipantWithStatus[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    pending: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token) {
          router.push("/login");
          return;
        }

        if (role !== "admin" && role !== "organizer") {
          alert("Access denied.");
          router.push("/events");
          return;
        }

        const participantsData = await getParticipants(token, eventId);
        const attendanceData = await getAttendance(token, eventId);

        const attendanceMap = new Map(
          attendanceData.map((record: any) => [
            record.user_email,
            record.recorded_at,
          ])
        );

        let checkedInCount = 0;
        const merged: ParticipantWithStatus[] = participantsData.map(
          (p: any) => {
            const checkedInAt = attendanceMap.get(p.email);
            const isCheckedIn = !!checkedInAt;
            if (isCheckedIn) checkedInCount++;

            return {
              id: p.id,
              name: p.name || "Unknown",
              email: p.email,
              ticket_type: p.ticket_type || "Standard",
              isCheckedIn,
              checkedInAt,
            };
          }
        );

        setParticipants(merged);
        setStats({
          total: merged.length,
          checkedIn: checkedInCount,
          pending: merged.length - checkedInCount,
        });
      } catch (error) {
        console.error("Failed to load participants data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventId, router]);

  const handleExport = () => {
    if (participants.length === 0) {
      toast.error("No data available to export");
      return;
    }
    const data = participants.map((p) => ({
      "Name": p.name,
      "Email": p.email,
      "Registration Type": p.ticket_type,
      "Status": p.isCheckedIn ? "Checked In" : "Pending",
      "Check-in Time": p.checkedInAt ? new Date(p.checkedInAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A"
    }));
    exportToCSV("participants-list", data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:py-10 space-y-6">
          <PageHeaderSkeleton />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-[24px] bg-[#E8E1D5]/30 animate-pulse" />
            ))}
          </div>
          <div className="h-[400px] rounded-[24px] bg-[#E8E1D5]/30 animate-pulse mt-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#183028]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:py-10 space-y-8">
        
        {/* Header Card */}
        <Card className="overflow-hidden rounded-[24px] border border-[#E8E1D5] bg-white shadow-sm">
          <CardContent className="p-6 sm:p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
             <h1 className="mt-2 font-serif text-[3.2rem] leading-[0.92] tracking-[-0.05em] text-[#183028]">
                 Event Participants
               </h1>
              <p className="mt-2 text-base text-[#5E665F]">
                Manage and track attendee registration and check-in status.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F2EA] px-4 py-2 text-sm font-semibold text-[#0F4D3F]">
                <Users className="h-4 w-4" />
                {stats.total} Total
              </div>
              <Button 
                onClick={handleExport}
                className="rounded-full bg-[#0F4D3F] px-4 text-white hover:bg-[#0F4D3F]/90"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-[24px] border border-[#E8E1D5] bg-white shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F2EA] text-[#0F4D3F]">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#5E665F]">Total Participants</p>
                <p className="text-2xl font-bold text-[#183028]">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border border-[#E8E1D5] bg-white shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5F0ED] text-[#0F4D3F]">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#5E665F]">Checked In</p>
                <p className="text-2xl font-bold text-[#183028]">{stats.checkedIn}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border border-[#E8E1D5] bg-white shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F9EFE5] text-[#8C5A2A]">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#5E665F]">Pending Arrival</p>
                <p className="text-2xl font-bold text-[#183028]">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participants Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-[#183028]">
            Attendee List
          </h2>
          
          <div className="overflow-hidden rounded-[24px] border border-[#E8E1D5] bg-white shadow-sm">
            {participants.length === 0 ? (
              <div className="p-10">
                <EmptyState
                  icon={<Ticket className="h-5 w-5 text-[#0F4D3F]" />}
                  title="No participants yet"
                  description="Invite attendees or wait for registrations to roll in."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E8E1D5] bg-[#FAF8F4] text-left">
                      <th className="p-5 text-sm font-semibold text-[#183028]">Participant</th>
                      <th className="p-5 text-sm font-semibold text-[#183028]">Email</th>
                      <th className="p-5 text-sm font-semibold text-[#183028]">Registration Type</th>
                      <th className="p-5 text-sm font-semibold text-[#183028]">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => (
                      <tr 
                        key={participant.id} 
                        className="border-b border-[#E8E1D5] bg-white transition-colors hover:bg-[#FAF8F4] last:border-0"
                      >
                        <td className="p-5 text-sm font-medium text-[#183028]">
                          {participant.name}
                        </td>
                        <td className="p-5 text-sm text-[#5E665F]">
                          {participant.email}
                        </td>
                        <td className="p-5 text-sm text-[#5E665F]">
                          <Badge variant="outline" className="border-[#E8E1D5] text-[#5E665F] font-normal bg-white">
                            {participant.ticket_type}
                          </Badge>
                        </td>
                        <td className="p-5">
                          {participant.isCheckedIn ? (
                            <Badge className="rounded-full bg-[#E5F0ED] px-3 py-1 text-xs font-semibold text-[#0F4D3F] hover:bg-[#E5F0ED] border-none flex w-fit items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#0F4D3F]"></span>
                              Checked In
                            </Badge>
                          ) : (
                            <Badge className="rounded-full bg-[#F5F2EA] px-3 py-1 text-xs font-semibold text-[#5E665F] hover:bg-[#F5F2EA] border-none flex w-fit items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#A3A8A4]"></span>
                              Pending
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}