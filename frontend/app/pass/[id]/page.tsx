"use client";

import QRCode from "react-qr-code";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getRegistration } from "@/lib/api";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Ticket,
  QrCode,
  ShieldCheck,
  Download,
} from "lucide-react";

export default function PassPage() {
  const params = useParams();

  const [registration, setRegistration] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadRegistration() {
      const id = params?.id;

      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const token =
  localStorage.getItem("token");

if (!token) {
  setLoading(false);
  return;
}

const data =
  await getRegistration(
    token,
    Number(id)
  );


        setRegistration(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadRegistration();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Pass...
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Registration not found
      </div>
    );
  }

  const qrData = JSON.stringify({
    registration_id:
      registration.registration_id,

    event_id:
      registration.event_id,

    user_id:
      registration.user_id,

    participant_name:
      registration.participant_name,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 p-8 text-white">
          <div className="flex items-center gap-3">
            <Ticket className="w-8 h-8" />

            <div>
              <h1 className="text-3xl font-bold">
                EVENT PASS
              </h1>

              <p className="opacity-90">
                Valid for event entry
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-8">
          {/* Event Name */}
          <div className="text-center">
            <h2 className="text-3xl font-bold break-all text-center">
  {registration.event_name}
</h2>

            <p className="text-muted-foreground mt-2">
              Event Registration Pass
            </p>
          </div>

          {/* Registration */}
          <div className="mt-8 rounded-lg border p-4 bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Registration ID
              </span>

              <span className="font-bold">
                #
                {
                  registration.registration_id
                }
              </span>
            </div>
          </div>

          {/* Participant */}
          <div className="mt-4 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Participant
            </p>

            <p className="font-semibold text-lg mt-1">
              {
                registration.participant_name
              }
            </p>

            <p className="text-sm text-muted-foreground mt-2">
              {
                registration.participant_email
              }
            </p>
          </div>

          {/* Divider */}
          <div className="my-8 border-t-2 border-dashed" />

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
             <QRCode
  value={qrData}
  size={240}
/>


            </div>

            <div className="flex items-center gap-2 mt-4 text-green-600">
              <ShieldCheck className="w-5 h-5" />

              <span className="font-medium">
                Verified Entry Pass
              </span>
            </div>
          </div>
<p className="text-sm text-muted-foreground text-center mt-2">
  Present this QR code at the entrance for verification.
</p>
          {/* Instructions */}
          <div className="mt-8 rounded-lg bg-muted p-4">
            <div className="flex items-start gap-3">
              <QrCode className="w-5 h-5 mt-0.5" />

              <div>
                <p className="font-medium">
                  Entry Instructions
                </p>

                <p className="text-sm text-muted-foreground mt-1">
                  Present this QR code at the
                  event entrance. The organizer
                  will scan it to verify your
                  registration.
                </p>
              </div>
            </div>
          </div>

          {/* Print */}
          <div className="mt-8">
            <Button
              className="w-full"
              onClick={() =>
                window.print()
              }
            >
              <Download className="w-4 h-4 mr-2" />
              Print Pass
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}