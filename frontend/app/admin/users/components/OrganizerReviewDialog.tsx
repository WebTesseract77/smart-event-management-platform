"use client";

import { useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle } from "lucide-react";
import { AdminOrganizerRequestItem } from "@/lib/api";
import {
  getInitials,
  requestStatusTone,
  requestStatusLabel,
  requestStatusIcon,
  formatSubmittedDate,
} from "../utils/adminUsersUtils";
import type { ReviewStep } from "../hooks/useAdminUsers";

interface OrganizerReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: AdminOrganizerRequestItem | null;
  reviewStep: ReviewStep;
  setReviewStep: (step: ReviewStep) => void;
  rejectRemark: string;
  setRejectRemark: (value: string) => void;
  reviewSubmitting: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export function OrganizerReviewDialog({
  open,
  onOpenChange,
  selectedRequest,
  reviewStep,
  setReviewStep,
  rejectRemark,
  setRejectRemark,
  reviewSubmitting,
  onApprove,
  onReject,
}: OrganizerReviewDialogProps) {
  const applicantName = selectedRequest?.name || "this applicant";
  const applicantEmail = selectedRequest?.email || "—";

  const applicantCategories: string[] = useMemo(() => {
    const raw = (selectedRequest as any)?.event_categories ?? (selectedRequest as any)?.categories;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string" && raw.trim()) {
      return raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }, [selectedRequest]);

  const portfolioUrl = (selectedRequest as any)?.portfolio_url as string | undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (reviewSubmitting) return;
        onOpenChange(next);
        if (!next) {
          setReviewStep("details");
          setRejectRemark("");
        }
      }}
    >
      <DialogContent
        className="
          w-[95vw] sm:w-[90vw] md:w-full
          max-w-[95vw] sm:max-w-[90vw] md:max-w-[920px] lg:max-w-[980px]
          max-h-[88vh]
          overflow-hidden overflow-x-hidden
          p-0
          rounded-[1.5rem] sm:rounded-[2rem]
          border border-white/70 bg-white shadow-2xl
          flex flex-col
        "
      >
        <div className="flex h-full max-h-[88vh] min-h-0 w-full min-w-0 flex-col overflow-hidden">
          {selectedRequest && reviewStep === "details" && (
            <>
              {/* HEADER — fixed */}
              <DialogHeader className="shrink-0 border-b border-[#E8E1D5] px-5 sm:px-8 pt-6 sm:pt-8 pb-5 pr-12 sm:pr-14">
                <div className="flex flex-wrap items-start justify-between gap-3 min-w-0 w-full">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 border border-[#E8E1D5] bg-[#0F4D3F] text-white shadow-sm">
                      <AvatarFallback className="bg-transparent text-sm sm:text-base font-semibold text-current">
                        {getInitials(selectedRequest.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <DialogTitle className="truncate text-xl sm:text-2xl font-bold tracking-tight text-[#183028]">
                        {applicantName}
                      </DialogTitle>
                      <p className="mt-0.5 truncate text-sm text-[#5E665F] break-all">{applicantEmail}</p>
                    </div>
                  </div>

                  {(() => {
                    const StatusIcon = requestStatusIcon(selectedRequest.status);
                    return (
                      <Badge
                        className={`shrink-0 flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${requestStatusTone(
                          selectedRequest.status
                        )}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                        {requestStatusLabel(selectedRequest.status)}
                      </Badge>
                    );
                  })()}
                </div>
              </DialogHeader>

              {/* BODY — only this area scrolls */}
              <div className="flex-1 min-h-0 min-w-0 w-full overflow-y-auto overflow-x-hidden px-5 sm:px-8 py-6 sm:py-7 space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0 w-full">
                  <div className="min-w-0 w-full overflow-hidden rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] p-4 sm:p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B938C]">
                      Organization
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-[#183028] break-words overflow-hidden">
                      {(selectedRequest as any).organization || "—"}
                    </p>
                  </div>

                  <div className="min-w-0 w-full overflow-hidden rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] p-4 sm:p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B938C]">
                      Submitted
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-[#183028] break-words overflow-hidden">
                      {formatSubmittedDate(selectedRequest.created_at)}
                    </p>
                  </div>

                  <div className="min-w-0 w-full overflow-hidden rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] p-4 sm:p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B938C]">
                      Experience
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-[#183028] break-words overflow-hidden">
                      {(selectedRequest as any).experience || "—"}
                    </p>
                  </div>

                  <div className="min-w-0 w-full overflow-hidden rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] p-4 sm:p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B938C]">
                      Events / Year
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-[#183028] break-words overflow-hidden">
                      {(selectedRequest as any).events_per_year ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 w-full overflow-hidden rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] p-4 sm:p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B938C]">
                    Portfolio
                  </p>
                  {portfolioUrl ? (
                    <a
                      href={portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 block text-sm font-medium text-[#0F4D3F] underline break-all overflow-hidden hover:text-[#0B3E33]"
                    >
                      {portfolioUrl}
                    </a>
                  ) : (
                    <p className="mt-1.5 text-sm text-[#5E665F]">—</p>
                  )}
                </div>

                <div className="min-w-0 w-full overflow-hidden rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] p-4 sm:p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B938C]">
                    Event Categories
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5 sm:gap-2 min-w-0 w-full">
                    {applicantCategories.length > 0 ? (
                      applicantCategories.map((category) => (
                        <Badge
                          key={category}
                          className="rounded-full border border-[#E8E1D5] bg-white px-3 py-1 text-xs font-medium text-[#183028] break-words max-w-full"
                        >
                          {category}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-[#5E665F]">—</p>
                    )}
                  </div>
                </div>

                <div className="min-w-0 w-full overflow-hidden rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] p-4 sm:p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B938C]">
                    Reason for Applying
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-[#183028] break-words whitespace-pre-wrap overflow-hidden">
                    {(selectedRequest as any).reason || "—"}
                  </p>
                </div>

                {selectedRequest.status === "rejected" && (selectedRequest as any).admin_remark && (
                  <div className="min-w-0 w-full overflow-hidden rounded-2xl border border-[#FCDEDE] bg-[#FDECEC] p-4 sm:p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#B42318]">
                      Admin Remark
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-[#7A241A] break-words whitespace-pre-wrap overflow-hidden">
                      {(selectedRequest as any).admin_remark}
                    </p>
                  </div>
                )}
              </div>

              {/* FOOTER — fixed */}
              <DialogFooter className="shrink-0 border-t border-[#E8E1D5] bg-white px-5 sm:px-8 py-4 sm:py-5 flex flex-col-reverse sm:flex-row flex-wrap gap-2 sm:gap-3 sm:justify-end">
                {selectedRequest.status === "pending" ? (
                  <>
                    <Button
                      variant="outline"
                      className="rounded-full w-full sm:w-auto border-[#E8E1D5] bg-white px-5 text-[#183028] hover:bg-[#FBFAF7]"
                      onClick={() => onOpenChange(false)}
                      disabled={reviewSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full w-full sm:w-auto border-[#B42318] bg-white px-5 text-[#B42318] hover:bg-[#FDECEC]"
                      onClick={() => setReviewStep("reject")}
                      disabled={reviewSubmitting}
                    >
                      <XCircle className="mr-2 h-4 w-4 shrink-0" />
                      Reject
                    </Button>
                    <Button
                      className="rounded-full w-full sm:w-auto bg-[#0F4D3F] px-5 text-white shadow-[0_8px_20px_rgba(15,77,63,0.25)] hover:bg-[#0B3E33]"
                      onClick={() => setReviewStep("confirm-approve")}
                      disabled={reviewSubmitting}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4 shrink-0" />
                      Approve
                    </Button>
                  </>
                ) : (
                  <Button
                    className="rounded-full w-full sm:w-auto bg-[#0F4D3F] px-5 text-white shadow-[0_8px_20px_rgba(15,77,63,0.25)] hover:bg-[#0B3E33]"
                    onClick={() => onOpenChange(false)}
                  >
                    Close
                  </Button>
                )}
              </DialogFooter>
            </>
          )}

          {selectedRequest && reviewStep === "confirm-approve" && (
            <>
              <DialogHeader className="shrink-0 border-b border-[#E8E1D5] px-5 sm:px-8 pt-6 sm:pt-8 pb-5 pr-12 sm:pr-14">
                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-[#183028] break-words">
                  Approve {applicantName}&apos;s request?
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 min-h-0 min-w-0 w-full overflow-y-auto overflow-x-hidden px-5 sm:px-8 py-6 sm:py-7">
                <DialogDescription className="text-sm leading-6 text-muted-foreground break-words">
                  {applicantName} will become an Organizer and gain permission to create and manage
                  their own events. This action can be reversed later from the Users tab.
                </DialogDescription>
              </div>
              <DialogFooter className="shrink-0 border-t border-[#E8E1D5] bg-white px-5 sm:px-8 py-4 sm:py-5 flex flex-col-reverse sm:flex-row flex-wrap gap-2 sm:gap-3 sm:justify-end">
                <Button
                  variant="outline"
                  className="rounded-full w-full sm:w-auto border-[#0F4D3F] bg-[#FAF8F4] px-5 text-[#0F4D3F] hover:bg-[#EAF3ED]"
                  onClick={() => setReviewStep("details")}
                  disabled={reviewSubmitting}
                >
                  Back
                </Button>
                <Button
                  className="rounded-full w-full sm:w-auto bg-[#0F4D3F] px-5 text-white shadow-[0_8px_20px_rgba(15,77,63,0.25)] hover:bg-[#0B3E33]"
                  onClick={onApprove}
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? "Approving..." : "Confirm Approve"}
                </Button>
              </DialogFooter>
            </>
          )}

          {selectedRequest && reviewStep === "reject" && (
            <>
              <DialogHeader className="shrink-0 border-b border-[#E8E1D5] px-5 sm:px-8 pt-6 sm:pt-8 pb-5 pr-12 sm:pr-14">
                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-[#183028] break-words">
                  Reject {applicantName}&apos;s request
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground break-words">
                  Add a remark explaining why this application is being rejected. The applicant
                  will be able to see this remark.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 min-h-0 min-w-0 w-full overflow-y-auto overflow-x-hidden px-5 sm:px-8 py-6 sm:py-7">
                <Textarea
                  value={rejectRemark}
                  onChange={(e) => setRejectRemark(e.target.value)}
                  placeholder="e.g. Portfolio link doesn't demonstrate prior event experience..."
                  className="min-h-[120px] w-full rounded-2xl border-[#E8E1D5] bg-[#FAF8F4] text-sm focus-visible:ring-[#0F4D3F]"
                  disabled={reviewSubmitting}
                />
                {!rejectRemark.trim() && (
                  <p className="mt-2 text-xs text-[#B42318]">An admin remark is required to reject.</p>
                )}
              </div>
              <DialogFooter className="shrink-0 border-t border-[#E8E1D5] bg-white px-5 sm:px-8 py-4 sm:py-5 flex flex-col-reverse sm:flex-row flex-wrap gap-2 sm:gap-3 sm:justify-end">
                <Button
                  variant="outline"
                  className="rounded-full w-full sm:w-auto border-[#0F4D3F] bg-[#FAF8F4] px-5 text-[#0F4D3F] hover:bg-[#EAF3ED]"
                  onClick={() => setReviewStep("details")}
                  disabled={reviewSubmitting}
                >
                  Back
                </Button>
                <Button
                  className="rounded-full w-full sm:w-auto bg-[#B42318] px-5 text-white shadow-[0_8px_20px_rgba(180,35,24,0.25)] hover:bg-[#921C13]"
                  onClick={onReject}
                  disabled={reviewSubmitting || !rejectRemark.trim()}
                >
                  {reviewSubmitting ? "Rejecting..." : "Confirm Reject"}
                </Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}