"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getParticipants,
  markAttendance,
  getAttendance,
} from "@/lib/api";

export default function ParticipantsPage() {
  const params = useParams();

  const [participants, setParticipants] =
    useState<any[]>([]);

  const [attendance, setAttendance] =
    useState<any[]>([]);

  async function handleAttendance(
    userId: number
  ) {
    try {
      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        alert("Please login");
        return;
      }

      await markAttendance(
        token,
        Number(params.id),
        userId
      );

      const updatedAttendance =
        await getAttendance(
          token,
          Number(params.id)
        );

      setAttendance(
        updatedAttendance
      );

      alert(
        "Attendance recorded successfully!"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Failed to record attendance."
      );
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return;
        }

        const participantsData =
          await getParticipants(
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
      }
    }

    loadData();
  }, [params]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Participants
      </h1>

      {participants.length === 0 ? (
        <p className="mt-4">
          No participants yet.
        </p>
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
        <p className="mt-3">
          No attendance records yet.
        </p>
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