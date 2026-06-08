"use client";

import QRCode from "react-qr-code";
import { useParams } from "next/navigation";

export default function PassPage() {
  const params = useParams();

  const qrData = JSON.stringify({
    registration_id: Number(params.id),
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">
        Event Pass
      </h1>

      <p className="mt-4">
        Registration ID: {params.id}
      </p>

      <div className="mt-8 bg-white p-4 inline-block">
        <QRCode
          value={qrData}
          size={250}
        />
      </div>

      <p className="mt-4 text-sm">
        Show this QR code to the organizer.
      </p>
    </div>
  );
}