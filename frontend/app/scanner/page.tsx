"use client";

import { useEffect, useState } from "react";
import {
  getRegistration,
  markAttendance,
} from "@/lib/api";

export default function ScannerPage() {
  const [participant, setParticipant] =
    useState<any>(null);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    let scanner: any;

    async function startScanner() {
      try {
        const { Html5Qrcode } =
          await import("html5-qrcode");

        scanner = new Html5Qrcode(
          "reader"
        );

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: 250,
          },
          async (decodedText: string) => {
            try {
              const qrData =
                JSON.parse(decodedText);

              const registration =
                await getRegistration(
                  qrData.registration_id
                );

              setParticipant(
                registration
              );

              setMessage("");

              await scanner.stop();
            } catch (error) {
              console.error(error);
            }
          },
          () => {}
        );
      } catch (error) {
        console.error(error);
      }
    }

    startScanner();

    return () => {
      if (scanner) {
        scanner
          .stop()
          .catch(() => {});
      }
    };
  }, []);

  async function handleAttendance() {
  if (!participant) return;

  try {
    await markAttendance(
      participant.event_id,
      participant.user_id
    );

    setMessage(
      "✅ Attendance recorded successfully!"
    );
  } catch (error: any) {
    if (
      error.message ===
      "Attendance already recorded"
    ) {
      setMessage(
        "⚠ Attendance already recorded"
      );
    } else {
      setMessage(
        "❌ Failed to record attendance"
      );
    }
  }
}
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Organizer Scanner
      </h1>

      <div
        id="reader"
        className="mt-6"
      />

      {participant && (
        <div className="border rounded p-4 mt-6 shadow">
          <h2 className="text-xl font-bold">
            Participant Found
          </h2>

          <p className="mt-2">
            <strong>Name:</strong>{" "}
            {participant.participant_name}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {participant.participant_email}
          </p>

          <p>
            <strong>Event:</strong>{" "}
            {participant.event_name}
          </p>

          <button
            className="border px-4 py-2 rounded mt-4"
            onClick={handleAttendance}
          >
            Mark Attendance
          </button>

          {message && (
            <p className="mt-4 font-semibold">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}