"use client";

import { AttendanceScanner } from "@/components/app/AttendanceScanner";

export default function ScannerPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <AttendanceScanner mode="admin" />
      </div>
    </div>
  );
}
