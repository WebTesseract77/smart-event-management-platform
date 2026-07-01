"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getParticipants,
  getAttendance,
} from "@/lib/api";
import { EmptyState, PageHeaderSkeleton } from "@/components/app/FeedbackStates";
import { Users } from "lucide-react";

export default function ParticipantsPage() {
  const params = useParams();
  const router = useRouter();

  const [participants, setParticipants] =
    useState<any[]>([]);

  const [attendance, setAttendance] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const role =
          localStorage.getItem(
            "role"
          );

        if (!token) {
          router.push("/login");
          return;
        }

        if (
          role !== "admin" &&
          role !== "organizer"
        ) {
          alert(
            "Access denied."
          );

          router.push("/events");

          return;
        }
const participantsData =
  await getParticipants(
    token,
    Number(params.id)
  );

        setParticipants(
          participantsData
        );

        const attendanceData =
          await getAttendance(
            token,
            Number(params.id)
          );

        setAttendance(
          attendanceData
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <PageHeaderSkeleton />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-3xl bg-background" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Participants
      </h1>

      {participants.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No participants yet"
          description="Invite attendees or check back later."
        />
      ) : (
        participants.map(
          (participant) => (
            <div
              key={participant.id}
              className="border rounded-lg p-4 mt-4 shadow"
            >
              <h3 className="text-xl font-bold">
                {participant.name}
              </h3>

              <p className="mt-1">
                {participant.email}
              </p>
            </div>
          )
        )
      )}

      <hr className="my-8" />

      <h2 className="text-2xl font-bold">
        Attendance History
      </h2>

      {attendance.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No attendance records yet"
          description="Attendance will appear once check-ins begin."
        />
      ) : (
        attendance.map(
          (record) => (
            <div
              key={record.id}
              className="border rounded p-3 mt-3"
            >
              <h3 className="font-bold">
                {record.user_name}
              </h3>

              <p>
                {record.user_email}
              </p>

              <p className="text-sm text-gray-600 mt-2">
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
              </p>
            </div>
          )
        )
      )}
    </div>
  );
}
