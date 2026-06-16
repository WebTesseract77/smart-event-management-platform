"use client";
import StatCard from "@/components/app/StatCard";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getAttendance } from "@/lib/api";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

type AttendanceRecord = {
  id: number;
  event_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  recorded_at: string;
};

export default function AttendancePage() {
  const params = useParams();

  const [attendance, setAttendance] =
    useState<AttendanceRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadAttendance() {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return;
        }

        const eventId = Number(
          params.eventId
        );

        const data =
          await getAttendance(
            token,
            eventId
          );

        setAttendance(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadAttendance();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Attendance...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-5xl font-bold">
            Attendance Records
          </h1>

          <p className="text-muted-foreground text-lg mt-3">
  Attendance analytics and check-in records.
</p>
        </div>
<div className="mb-6">
  <StatCard
    title="Attendees Checked In"
    value={attendance.length}
    icon={<Users className="h-6 w-6" />}
  />
</div>

        {attendance.length === 0 ? (
          <Card className="rounded-2xl shadow-sm">
  <CardContent className="p-12 text-center">

    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />

    <h2 className="text-2xl font-bold">
      No Attendance Yet
    </h2>

    <p className="text-muted-foreground mt-2">
      No attendees have checked in for this event.
    </p>

  </CardContent>
</Card>
        ) : (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b hover:bg-muted/40 transition-colors">
                    <th className="text-left p-4">
                      Name
                    </th>

                    <th className="text-left p-4">
                      Email
                    </th>

                    <th className="text-left p-4">
                      User ID
                    </th>

                    <th className="text-left p-4">
                      Checked In At
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.map(
                    (record) => (
                      <tr
                        key={record.id}
                        className="border-b"
                      >
                        <td className="p-4 font-medium">
                          {
                            record.user_name
                          }
                        </td>

                        <td className="p-4">
                          {
                            record.user_email
                          }
                        </td>

                        <td className="p-4">
                          #
                          {
                            record.user_id
                          }
                        </td>

                        <td className="p-4">
  {new Date(
    record.recorded_at
  ).toLocaleString(
    "en-IN",
    {
      timeZone:
        "Asia/Kolkata",
      dateStyle:
        "medium",
      timeStyle:
        "short",
    }
  )}
</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}