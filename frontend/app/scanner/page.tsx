"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";

import {
  markAttendance,
  getRegistration,
  getCurrentUser,
} from "@/lib/api";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function ScannerPage() {
  const scannerRef =
    useRef<Html5Qrcode | null>(null);

  const lastScanRef =
    useRef("");

  const [scanComplete, setScanComplete] =
    useState(false);

  useEffect(() => {
    async function startScanner() {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const user =
          await getCurrentUser(token);

        if (user.role !== "admin") {
          window.location.href = "/events";
          return;
        }

        const reader =
          document.getElementById("reader");

        if (!reader) {
          return;
        }

        scannerRef.current =
          new Html5Qrcode("reader");

        await scannerRef.current.start(
          {
            facingMode:
              "environment",
          },
          {
            fps: 10,
            qrbox: 250,
          },
          async (decodedText) => {
            if (
              decodedText ===
              lastScanRef.current
            ) {
              return;
            }

            lastScanRef.current =
              decodedText;

            try {
              let eventId: number;
              let userId: number;
              let attendeeName =
                "";

              if (
                decodedText
                  .trim()
                  .startsWith("{")
              ) {
                const data =
                  JSON.parse(
                    decodedText
                  );

                eventId =
                  Number(
                    data.event_id
                  );

                userId =
                  Number(
                    data.user_id
                  );

                attendeeName =
                  data.participant_name ??
                  "";
              } else {
                const registration =
                  await getRegistration(
                    Number(decodedText)
                  );

                eventId =
                  Number(
                    registration.event_id
                  );

                userId =
                  Number(
                    registration.user_id
                  );

                attendeeName =
                  registration.participant_name ??
                  "";
              }

              try {
                await markAttendance(
                  token,
                  eventId,
                  userId
                );

                toast.success(
                  attendeeName
                    ? `${attendeeName} checked in`
                    : `User #${userId} checked in`
                );
              } catch {
                toast.info(
                  "Attendance already marked"
                );
              }

              if (
                scannerRef.current
              ) {
                try {
                  await scannerRef.current.stop();
                } catch {}

                try {
                  await scannerRef.current.clear();
                } catch {}

                scannerRef.current =
                  null;
              }

              setScanComplete(true);
            } catch (error) {
              console.error(error);

              toast.error(
                "Invalid QR Code"
              );
            }
          },
          () => {}
        );
      } catch (error) {
        console.error(error);

        toast.error(
          "Could not access camera"
        );
      }
    }

    startScanner();

    return () => {
      const scanner =
        scannerRef.current;

      scannerRef.current =
        null;

      if (scanner) {
        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            try {
              scanner.clear();
            } catch {}
          });
      }
    };
  }, []);

  function restartScanner() {
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 text-center">

          {!scanComplete ? (
            <>
              <h1 className="text-4xl font-bold mb-4">
                Attendance Scanner
              </h1>

              <p className="text-muted-foreground mb-8">
                Point your camera at an attendee QR code.
              </p>
<p className="text-sm text-muted-foreground mt-2">
  Ensure the QR code is clearly visible and well lit.
</p>
              <div
                id="reader"
                className="mx-auto"
              />
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-4">
                ✅ Attendance Processed
              </h1>

              <p className="text-muted-foreground mb-8">
                Scan another attendee.
              </p>

              <button
                onClick={
                  restartScanner
                }
                className="rounded-lg px-6 py-3 bg-primary text-primary-foreground"
              >
                Scan Another QR
              </button>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}