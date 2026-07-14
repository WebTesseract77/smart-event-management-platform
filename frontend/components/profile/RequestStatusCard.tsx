"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface RequestStatusCardProps {
  request: {
    id?: number;
    status: "pending" | "approved" | "rejected";
    admin_remark?: string;
    cooldown_days_remaining?: number;
    created_at?: string;
    updated_at?: string;
  };
  onReopenWizard: () => void;
}

export default function RequestStatusCard({ request, onReopenWizard }: RequestStatusCardProps) {
  const formattedDate = request.created_at 
    ? new Date(request.created_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' });

  // 3. Conditional state renders matching exactly the requirements UI specs
  if (request.status === "pending") {
    return (
      <div className="rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] p-6 space-y-4 max-w-xl text-[#183028]">
        <div className="flex items-center justify-between border-b border-[#E8E1D5]/60 pb-3">
          <h4 className="text-base font-bold font-serif">Organizer Application</h4>
          <span className="text-xs font-semibold text-[#A9771E] bg-[#FFF6E7] border border-[#FCECD3] px-2.5 py-0.5 rounded-full">
            🟡 Pending Review
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-bold text-[#7C8B83] uppercase tracking-wider text-[9px]">Submitted Date</p>
            <p className="font-semibold mt-0.5 text-[#183028]">{formattedDate}</p>
          </div>
          <div>
            <p className="font-bold text-[#7C8B83] uppercase tracking-wider text-[9px]">Estimated Review</p>
            <p className="font-semibold mt-0.5 text-[#183028]">1–3 Business Days</p>
          </div>
        </div>

        <p className="text-xs text-[#5E665F] font-medium leading-relaxed">
          You'll receive an email after review. No action is required from you at this time.
        </p>
      </div>
    );
  }

  if (request.status === "approved") {
    return (
      <div className="rounded-2xl border border-[#D1ECD5] bg-[#ECF7EE]/40 p-6 space-y-4 max-w-xl text-[#183028]">
        <div className="flex items-center justify-between border-b border-[#D1ECD5] pb-3">
          <h4 className="text-base font-bold font-serif flex items-center gap-2">
            <span>🟢 Organizer Access Granted</span>
          </h4>
        </div>

        <div className="text-xs space-y-1">
          <p className="font-bold text-[#7C8B83] uppercase tracking-wider text-[9px]">Approved Date: {formattedDate}</p>
          <p className="font-semibold text-sm text-[#0F4D3F] mt-1">Congratulations!</p>
          <p className="text-xs text-[#5E665F]">You can now create and manage events framework natively.</p>
        </div>

        <Button 
          onClick={() => window.location.href = "/organizer/dashboard"} // Using existing router conventions
          className="w-full rounded-full bg-[#0F4D3F] text-xs font-semibold text-white hover:bg-[#0A352B]"
        >
          Go To Organizer Dashboard
        </Button>
      </div>
    );
  }

  if (request.status === "rejected") {
    const cooldownDays = request.cooldown_days_remaining ?? 0;
    const isCooldownActive = cooldownDays > 0;

    return (
      <div className="rounded-2xl border border-[#FCDEDE] bg-[#FDECEC]/30 p-6 space-y-4 max-w-xl text-[#183028]">
        <div className="flex items-center justify-between border-b border-[#FCDEDE] pb-3">
          <h4 className="text-base font-bold font-serif flex items-center gap-2">
            <span>🔴 Application Rejected</span>
          </h4>
        </div>

        <div className="text-xs space-y-2">
          <div>
            <p className="font-bold text-[#7C8B83] uppercase tracking-wider text-[9px]">Admin Remark</p>
            <p className="text-[#183028] font-medium mt-0.5 bg-white/75 p-3 rounded-xl border border-[#E8E1D5] leading-relaxed">
              {request.admin_remark || "Application submission details do not match platform verification parameters."}
            </p>
          </div>
          {isCooldownActive && (
            <div>
              <p className="font-bold text-[#7C8B83] uppercase tracking-wider text-[9px]">Cooldown Remaining</p>
              <p className="text-xs font-semibold text-[#B42318] mt-0.5">{cooldownDays} Days Remaining</p>
            </div>
          )}
        </div>

        <Button
          onClick={onReopenWizard}
          disabled={isCooldownActive}
          className="w-full rounded-full bg-[#0F4D3F] text-xs font-semibold text-white hover:bg-[#0A352B] disabled:bg-[#7C8B83] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isCooldownActive ? `Apply Again (Locked)` : `Apply Again`}
        </Button>
      </div>
    );
  }

  return null;
}