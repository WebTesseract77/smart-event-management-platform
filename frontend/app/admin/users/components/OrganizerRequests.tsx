"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/app/FeedbackStates";
import { ClipboardList, Mail, Eye } from "lucide-react";
import { AdminOrganizerRequestItem } from "@/lib/api";
import {
  getInitials,
  requestStatusTone,
  requestStatusLabel,
  requestStatusIcon,
  formatSubmittedDate,
} from "../utils/adminUsersUtils";

interface OrganizerRequestsProps {
  requests: AdminOrganizerRequestItem[];
  hasAnyRequests: boolean;
  onReview: (request: AdminOrganizerRequestItem) => void;
}

export function OrganizerRequests({ requests, hasAnyRequests, onReview }: OrganizerRequestsProps) {
  if (requests.length === 0) {
    return (
      <div className="py-12 border border-dashed rounded-[22px] border-[#E8E1D5] w-full">
        <EmptyState
          icon={<ClipboardList className="h-5 w-5" />}
          title={hasAnyRequests ? "No matches" : "No organizer requests"}
          description={
            hasAnyRequests
              ? "Try adjusting your search."
              : "Organizer applications will appear here once submitted."
          }
        />
      </div>
    );
  }

  return (
    <>
      {/* MOBILE STACKED CARD VIEW — ORGANIZER REQUESTS */}
      <div className="grid gap-4 md:hidden w-full min-w-0">
        {requests.map((request) => {
          const StatusIcon = requestStatusIcon(request.status);
          return (
            <div key={request.id} className="p-3 sm:p-4 rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4]/50 space-y-4 w-full min-w-0">
              <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2 w-full min-w-0">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <Avatar className="h-11 w-11 shrink-0 border border-[#E8E1D5] bg-[#0F4D3F] text-white shadow-sm">
                    <AvatarFallback className="bg-transparent text-xs font-semibold text-current">
                      {getInitials(request.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-[#183028]">{request.name || "Applicant"}</p>
                    <p className="mt-0.5 text-xs text-[#5E665F]">{formatSubmittedDate(request.created_at)}</p>
                  </div>
                </div>
                <Badge className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold shrink-0 sm:whitespace-nowrap flex items-center gap-1 ${requestStatusTone(request.status)}`}>
                  <StatusIcon className="h-3 w-3 shrink-0" />
                  {requestStatusLabel(request.status)}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#5E665F] min-w-0 w-full">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#C6922F]" />
                <span className="truncate break-all flex-1 min-w-0">{request.email}</span>
              </div>

              <div className="pt-3 border-t border-[#E8E1D5]/60 flex justify-end w-full min-w-0">
                <Button size="sm" className="w-full h-9 rounded-full bg-[#0F4D3F] text-xs text-white hover:bg-[#0B3E33] flex items-center justify-center px-4" onClick={() => onReview(request)}>
                  <Eye className="mr-1.5 h-3.5 w-3.5 shrink-0" /> Review
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE VIEW — ORGANIZER REQUESTS */}
      <div className="hidden md:block w-full overflow-hidden">
        <Table className="overflow-hidden rounded-[22px] w-full">
          <TableHeader className="border-b border-[#E8E1D5]">
            <TableRow className="border-b border-[#E8E1D5]">
              <TableHead className="pl-6 py-4 text-[0.95rem] font-medium text-[#5E665F]">Applicant</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const StatusIcon = requestStatusIcon(request.status);
              return (
                <TableRow key={request.id} className="transition-colors hover:bg-[#FBFAF7]">
                  <TableCell className="pl-6 py-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 border border-[#E8E1D5] bg-[#0F4D3F] text-white shadow-sm shrink-0">
                        <AvatarFallback className="bg-transparent text-xs font-semibold text-current">
                          {getInitials(request.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-[#183028]">{request.name || "Applicant"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-2 text-[0.92rem] text-[#5E665F]">
                      <Mail className="h-4 w-4 shrink-0 text-[#C6922F]" />
                      <span className="truncate">{request.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 text-[0.92rem] text-[#5E665F]">
                    {formatSubmittedDate(request.created_at)}
                  </TableCell>
                  <TableCell className="py-5">
                    <Badge className={`rounded-full border px-3 py-1.5 text-xs font-semibold flex w-fit items-center gap-1 ${requestStatusTone(request.status)}`}>
                      <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                      {requestStatusLabel(request.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 py-5 text-right">
                    <Button size="sm" className="h-10 rounded-full bg-[#0F4D3F] px-4 text-xs text-white hover:bg-[#0B3E33]" onClick={() => onReview(request)}>
                      <Eye className="mr-2 h-4 w-4 shrink-0" /> Review
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}