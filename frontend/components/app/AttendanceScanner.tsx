"use client";

import { QrCode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCurrentUser,
  getRegistration,
  markAttendance,
  markOrganizerAttendance,
} from "@/lib/api";

type AttendanceScannerProps = {
  mode: "admin" | "organizer";
  eventId?: number;
  onRecorded?: () => void;
  title?: string;
  description?: string;
};

export function AttendanceScanner({
  mode,
  eventId,
  onRecorded,
  title,
  description,
}: AttendanceScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef("");
  const [scanComplete, setScanComplete] = useState(false);

  useEffect(() => {
    async function startScanner() {
      try {
        const currentToken = localStorage.getItem("token");

        if (!currentToken) {
          window.location.href = "/login";
          return;
        }

        const user = await getCurrentUser(currentToken!);

        if (mode === "admin" && user.role !== "admin") {
          window.location.href = "/events";
          return;
        }

        if (mode === "organizer" && user.role !== "organizer") {
          window.location.href = "/events";
          return;
        }

        const reader = document.getElementById("reader");
        if (!reader) return;

        scannerRef.current = new Html5Qrcode("reader");

        await scannerRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            if (decodedText === lastScanRef.current) {
              return;
            }

            lastScanRef.current = decodedText;

            try {
              let scannedEventId: number;
              let userId: number;
              let attendeeName = "";

              if (decodedText.trim().startsWith("{")) {
                const data = JSON.parse(decodedText);
                scannedEventId = Number(data.event_id);
                userId = Number(data.user_id);
                attendeeName = data.participant_name ?? "";
              } else {
                const registration = await getRegistration(currentToken!, Number(decodedText));
                scannedEventId = Number(registration.event_id);
                userId = Number(registration.user_id);
                attendeeName = registration.participant_name ?? "";
              }

              if (eventId && scannedEventId !== eventId) {
                throw new Error("QR does not belong to this event");
              }

              if (mode === "organizer") {
                if (!eventId) {
                  throw new Error("Organizer attendance requires an event");
                }

                await markOrganizerAttendance(currentToken!, eventId, userId);
              } else {
                await markAttendance(currentToken!, scannedEventId, userId);
              }

              toast.success(
                attendeeName
                  ? `${attendeeName} checked in`
                  : `User #${userId} checked in`
              );

              onRecorded?.();

              if (scannerRef.current) {
                try {
                  await scannerRef.current.stop();
                } catch {}

                try {
                  await scannerRef.current.clear();
                } catch {}

                scannerRef.current = null;
              }

              setScanComplete(true);
            } catch (error) {
              console.error(error);
              toast.error("Invalid QR Code");
            }
          },
          () => {}
        );
      } catch (error) {
        console.error(error);
        toast.error("Could not access camera");
      }
    }

    startScanner();

    return () => {
      const scanner = scannerRef.current;
      scannerRef.current = null;

      if (scanner) {
        scanner.stop().catch(() => {}).finally(() => {
          try {
            scanner.clear();
          } catch {}
        });
      }
    };
  }, [eventId, mode, onRecorded]);

  function restartScanner() {
    window.location.reload();
  }

  return (
    <Card className="rounded-[2rem] border bg-background/90 shadow-sm">
      <CardContent className="p-6 sm:p-8 text-center">
        {!scanComplete ? (
          <>
            <div className="mb-4 flex flex-col items-center">
              <QrCode className="mb-3 h-12 w-12 text-violet-600" />
              <h2 className="text-3xl font-bold tracking-tight">
                {title || "Attendance Scanner"}
              </h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              {description || "Point your camera at an attendee QR code."}
            </p>
            <p className="mb-8 text-sm text-muted-foreground">
              Ensure the QR code is clearly visible and well lit.
            </p>
            <div
              id="reader"
              className="mx-auto overflow-hidden rounded-2xl border bg-background"
            />
          </>
        ) : (
          <>
            <div className="mb-4 flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
                ✓
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Attendance Processed
              </h2>
            </div>
            <p className="mb-8 text-sm text-muted-foreground">
              Scan another attendee.
            </p>
            <Button size="lg" onClick={restartScanner}>
              Scan Another QR
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
