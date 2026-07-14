"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, Copy } from "lucide-react";

interface RequestStatusCardProps {
  request?: {
    id?: number;
    status: "pending" | "approved" | "rejected";
    admin_remark?: string;
    cooldown_days_remaining?: number;
    created_at?: string;
    updated_at?: string;
  } | null;
  // Current, authoritative user role. This — not request.status — decides
  // whether the user actually has organizer access right now.
  userRole?: string;
  onReopenWizard: () => void;
}

function formatDate(raw?: string) {
  const date = raw ? new Date(raw) : new Date();
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const ADMIN_EMAIL = "admin.eventsphere@gmail.com";

export default function RequestStatusCard({ request, userRole, onReopenWizard }: RequestStatusCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(ADMIN_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy admin email:", err);
    }
  }

  // 1. user.role === "organizer" → always show the Access Granted card,
  //    regardless of what the (possibly stale) request status says.
  if (userRole === "organizer") {
    const approvedDate =
      request?.status === "approved" ? formatDate(request.updated_at || request.created_at) : null;

    return (
      <div className="rounded-2xl border border-[#D1ECD5] bg-[#ECF7EE]/40 p-6 space-y-4 max-w-xl text-[#183028]">
        <div className="flex items-center justify-between border-b border-[#D1ECD5] pb-3">
          <h4 className="text-base font-bold font-serif flex items-center gap-2">
            <span>🟢 Organizer Access Granted</span>
          </h4>
        </div>

        <div className="text-xs space-y-1">
          {approvedDate && (
            <p className="font-bold text-[#7C8B83] uppercase tracking-wider text-[9px]">
              Approved Date: {approvedDate}
            </p>
          )}
          <p className="font-semibold text-sm text-[#0F4D3F] mt-1">Congratulations!</p>
          <p className="text-xs text-[#5E665F]">You can now create and manage events framework natively.</p>
        </div>

        <Button
          onClick={() => router.push("/create-event")}
          className="w-full rounded-full bg-[#0F4D3F] text-xs font-semibold text-white hover:bg-[#0A352B]"
        >
          Start Creating Events
        </Button>
      </div>
    );
  }

  // Below this point, userRole !== "organizer". Everything renders off the
  // request status, which reflects the applicant flow (or a past grant that
  // has since been revoked).
  if (!request) return null;

  // 2. Pending review.
  if (request.status === "pending") {
    const formattedDate = formatDate(request.created_at);

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

  // 3. Rejected.
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

  // 4. request.status === "approved" but userRole !== "organizer" → the
  //    request was approved at some point, but access has since been
  //    revoked by an admin. This is NOT the same as the success state above.
  if (request.status === "approved") {
    // Revocation is a more serious action than a rejection — there is no
    // self-service reapplication path here, only a way to reach an admin.
    const removedDate = formatDate(request.updated_at || request.created_at);

    return (
      <div className="rounded-2xl border border-[#FCECD3] bg-[#FFF6E7]/50 p-6 space-y-4 max-w-xl text-[#183028]">
        <div className="flex items-center justify-between border-b border-[#FCECD3] pb-3">
          <h4 className="text-base font-bold font-serif flex items-center gap-2 text-[#A9771E]">
            <AlertTriangle className="h-4 w-4" />
            <span>Organizer Access Removed</span>
          </h4>
        </div>

        <div className="text-xs space-y-2">
          <p className="font-bold text-[#7C8B83] uppercase tracking-wider text-[9px]">Removed On: {removedDate}</p>
          <p className="text-[#183028] font-medium leading-relaxed">
            If you believe this action was taken in error, please contact the EventSphere administration team for
            assistance.
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-bold text-[#7C8B83] uppercase tracking-wider text-[9px]">Contact Administrator</p>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E8E1D5] bg-white/75 px-4 py-3">
            <span className="truncate text-sm font-medium text-[#183028]">{ADMIN_EMAIL}</span>
            <Button
              type="button"
              onClick={handleCopyEmail}
              className="shrink-0 rounded-full bg-[#0F4D3F] px-3.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#0A352B]"
            >
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Copy className="h-3.5 w-3.5" />
                  Copy Email
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
