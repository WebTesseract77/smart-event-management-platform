import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCurrentUser,
  scanAttendance,
} from "@/lib/api";

type AttendanceScannerProps = {
  mode: "admin" | "organizer";
  eventId?: number;
  onRecorded?: () => void;
};

export function AttendanceScanner({
  mode,
  eventId,
  onRecorded,
}: AttendanceScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef(false);
  const lastScanRef = useRef("");
  
  const [scanComplete, setScanComplete] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [animateScanner, setAnimateScanner] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function startScanner() {
      if (scannerRef.current || isStartingRef.current) return;
      isStartingRef.current = true;

      try {
        const currentToken = localStorage.getItem("token");

        if (!currentToken) {
          if (isMounted) window.location.href = "/login";
          return;
        }

        const user = await getCurrentUser(currentToken);
        if (user.role !== "admin" && user.role !== "organizer") {
          if (isMounted) window.location.href = "/events";
          return;
        }

        const reader = document.getElementById("reader");
        if (!reader) {
          isStartingRef.current = false;
          return;
        }

        reader.innerHTML = "";

        const html5QrcodeInstance = new Html5Qrcode("reader");
        scannerRef.current = html5QrcodeInstance;

        await html5QrcodeInstance.start(
          { facingMode: "environment" },
          { 
            fps: 10, 
            qrbox: { width: 300, height: 300 }
          },
          async (decodedText) => {
            if (decodedText === lastScanRef.current) {
              return;
            }

            lastScanRef.current = decodedText;

            try {

              const attendance = await scanAttendance(
                currentToken,
                decodedText
              );

              if (
                mode === "organizer" &&
                eventId &&
                attendance.event_id !== eventId
              ) {
                throw new Error(
                  "QR does not belong to this event"
                );
              }

              toast.success(
                `${attendance.user_name} checked in`
              );

              setScanComplete(true);
              onRecorded?.();

              const currentScanner = scannerRef.current;

              if (currentScanner) {
                try {
                  const state = currentScanner.getState();

                  if (state === 2 || state === 3) {
                    await currentScanner.stop();
                  }
                } catch {}

                try {
                  await currentScanner.clear();
                } catch {}

                if (scannerRef.current === currentScanner) {
                  scannerRef.current = null;
                }
              }
            } catch (error: any) {
              console.error(error);

              const errorMessage =
                error?.message || "Invalid QR Code";
              
              // Defensively check for user_name in common error response structures
              const userName = error?.user_name || error?.response?.data?.user_name || error?.data?.user_name;

              if (
                errorMessage.toLowerCase().includes("already")
              ) {
                if (userName) {
                  toast.error(`${userName} is already checked in.`);
                } else {
                  toast.error("Attendance already recorded");
                }
              } else {
                toast.error(errorMessage);
              }
            }
          },
          () => {} // Ignore continuous scan failures when no QR is visible
        );
      } catch (error) {
        console.error(error);
        if (isMounted) {
          toast.error("Could not access camera");
        }
      } finally {
        isStartingRef.current = false;
        if (isMounted) {
          setIsRestarting(false);
          // Trigger a brief highlight animation once the scanner is fully started
          setAnimateScanner(true);
          setTimeout(() => {
            if (isMounted) setAnimateScanner(false);
          }, 700);
        }
      }
    }

    if (!scanComplete) {
      startScanner();
    }

    return () => {
      isMounted = false;
      const currentScanner = scannerRef.current;
      if (currentScanner) {
        scannerRef.current = null;
        (async () => {
          try {
            const state = currentScanner.getState();
            if (state === 2 || state === 3) {
              await currentScanner.stop();
            }
          } catch {}
          try {
            await currentScanner.clear();
          } catch {}
        })();
      }
    };
  }, [eventId, mode, onRecorded, scanComplete]);

  function restartScanner() {
    if (isRestarting) return;
    
    setIsRestarting(true);
    lastScanRef.current = "";
    toast.success("Scanner reset. Ready for the next participant.");

    if (scanComplete) {
      // If stopped from a successful scan, this triggers the useEffect to reboot it
      setScanComplete(false);
    } else {
      // If it's already actively scanning (e.g., failed scan state), just visually reset
      setIsRestarting(false);
      setAnimateScanner(true);
      setTimeout(() => setAnimateScanner(false), 700);
    }
  }

  return (
    <Card className="rounded-[24px] border border-[#E8E1D5] bg-white shadow-sm w-full">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#183028]">
            Attendance Scanner
          </h2>
          <p className="mt-1 text-sm text-[#5E665F]">
            Scan participant QR pass
          </p>
        </div>

        <div className="space-y-6">
          <div 
            className={`overflow-hidden rounded-[20px] bg-[#FAF8F4] border transition-all duration-500 ${
              animateScanner ? "border-[#0F4D3F] ring-4 ring-[#0F4D3F]/20" : "border-[#E8E1D5]"
            } ${
              isRestarting ? "opacity-50 scale-[0.98]" : "opacity-100 scale-100"
            }`}
          >
            <div 
              id="reader" 
              className="w-full h-[420px] [&>video]:!h-full [&>video]:!w-full [&>video]:!object-cover [&>canvas]:hidden" 
            />
          </div>
          
          <Button
            size="lg"
            disabled={isRestarting}
            className="h-12 w-full rounded-full bg-[#0F4D3F] px-6 text-white hover:bg-[#0F4D3F]/90 transition-colors disabled:opacity-80 disabled:cursor-not-allowed"
            onClick={restartScanner}
          >
            {isRestarting ? "Restarting..." : "Reset Scanner"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}