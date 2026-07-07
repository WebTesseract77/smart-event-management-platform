"use client";

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import EventForm from "@/components/app/EventForm";
import { Users } from "lucide-react";

export default function TeamEventPage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role !== "organizer") {
      router.push("/events");
    }
  }, [router]);


  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <div className="mx-auto max-w-[1490px] px-6 py-8">
        <div 
          className="mb-8 rounded-[32px] border border-[#E8E1D5] bg-white p-6 md:p-10"
          style={{ boxShadow: '0 18px 45px rgba(24, 48, 40, 0.06)' }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E1D5] bg-[#F5F2EA] px-4 py-2 text-sm font-medium text-[#0F4D3F]">
            <Users className="h-4 w-4 text-[#0F4D3F]" />
            Team Event
          </div>

         <h1 className="mt-7 font-serif text-[3.2rem] leading-[0.92] tracking-[-0.05em] text-[#183028]">
               Create Team Event
          </h1>

          {/* Subtle gold accent divider line */}
          <div className="my-4 h-[2px] w-12 bg-[#C6922F]" />

          <p className="max-w-2xl text-[#5E665F] leading-relaxed break-words">
            Configure team registrations, team size limits, payments, QR passes,
            and attendance for collaborative events like hackathons and
            competitions.
          </p>
        </div>

        <EventForm mode="team" />
      </div>
    </main>
  );
}