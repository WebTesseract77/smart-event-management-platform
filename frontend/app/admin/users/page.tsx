"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageHeaderSkeleton } from "@/components/app/FeedbackStates";
import { ShieldCheck, AlertCircle, Search, RefreshCcw, ClipboardList } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { HeroSection } from "./components/HeroSection";
import { UsersTable } from "./components/UsersTable";
import { OrganizerRequests } from "./components/OrganizerRequests";
import { OrganizerReviewDialog } from "./components/OrganizerReviewDialog";
import { RoleChangeDialog } from "./components/RoleChangeDialog";
import { useAdminUsers } from "./hooks/useAdminUsers";

function UserRowSkeleton() {
  return (
    <TableRow className="animate-pulse">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-11 w-10 rounded-full bg-muted/70" />
          <div className="space-y-2">
            <div className="h-4 w-28 rounded-full bg-muted/70" />
            <div className="h-3 w-36 rounded-full bg-muted/60" />
          </div>
        </div>
      </TableCell>
      <TableCell><div className="h-4 w-44 rounded-full bg-muted/60" /></TableCell>
      <TableCell><div className="h-7 w-28 rounded-full bg-muted/60" /></TableCell>
      <TableCell className="text-right"><div className="ml-auto h-9 w-36 rounded-full bg-muted/60" /></TableCell>
    </TableRow>
  );
}

export default function AdminUsersPage() {
  const reduceMotion = useReducedMotion();
  const {
    loading,
    error,
    users,
    filteredUsers,
    stats,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    view,
    setView,
    organizerRequests,
    filteredRequests,
    selectedUser,
    targetRole,
    dialogOpen,
    setDialogOpen,
    saving,
    openDialog,
    confirmRoleChange,
    selectedRequest,
    reviewDialogOpen,
    setReviewDialogOpen,
    reviewStep,
    setReviewStep,
    rejectRemark,
    setRejectRemark,
    reviewSubmitting,
    openReviewDialog,
    handleApproveRequest,
    handleRejectRequest,
    refreshUsers,
  } = useAdminUsers();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] p-4 sm:p-6 md:p-8 w-full overflow-x-hidden">
        <div className="mx-auto max-w-[1490px] space-y-6 w-full">
          <PageHeaderSkeleton />
          <Card className="rounded-[2rem] border border-[#E8E1D5] bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-3xl bg-muted/60" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border border-[#E8E1D5] bg-white shadow-sm">
            <CardContent className="p-4 md:p-0">
              <div className="space-y-4 md:hidden w-full min-w-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-muted/60" />
                ))}
              </div>
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <UserRowSkeleton key={index} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] p-4 sm:p-6 md:p-8 w-full overflow-x-hidden">
        <div className="mx-auto max-w-[1490px] w-full">
          <EmptyState
            icon={<AlertCircle className="h-6 w-6" />}
            title="Unable to load users"
            description={error}
            actionLabel="Go to Dashboard"
            actionHref="/dashboard"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] w-full overflow-x-hidden">
      <div className="relative isolate overflow-hidden w-full">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,rgba(198,146,47,0.08),transparent_26%)]" />
        <motion.div
          className="mx-auto max-w-[1490px] px-3 sm:px-6 py-6 sm:py-8 lg:py-12 w-full min-w-0"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-6 w-full">
            {/* HERO CARD */}
            <HeroSection stats={stats} />

            {/* MAIN CONTENT CARD */}
            <Card className="rounded-[24px] md:rounded-[28px] border border-[#E8E1D5] bg-white shadow-[0_16px_40px_rgba(24,48,40,0.05)] w-full">
              <CardContent className="p-3 sm:p-6 w-full">

                {/* FILTERS PANEL */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full">
                  <div className="relative w-full lg:max-w-[430px]">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8B938C] shrink-0" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={view === "users" ? "Search users..." : "Search applicants..."}
                      className="h-[48px] sm:h-[56px] rounded-full border-[#E8E1D5] bg-[#FAF8F4] pl-12 text-sm sm:text-[16px] shadow-none focus-visible:ring-[#0F4D3F] w-full"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto min-w-0">
                    {[
                      { label: "All", value: "all" },
                      { label: "Admins", value: "admin" },
                      { label: "Organizers", value: "organizer" },
                      { label: "Users", value: "user" },
                    ].map(({ label, value }) => (
                      <Button
                        key={label}
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setRoleFilter(value as any);
                          setView("users");
                        }}
                        className={`h-[38px] sm:h-[46px] text-xs sm:text-sm rounded-full px-3 sm:px-6 transition-all ${
                          view === "users" && roleFilter === value
                            ? "bg-[#0F4D3F] border-[#0F4D3F] text-white"
                            : "border-[#E8E1D5] bg-white text-[#183028] hover:bg-[#FBFAF7]"
                        }`}
                      >
                        {label}
                      </Button>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setView("requests")}
                      className={`h-[38px] sm:h-[46px] text-xs sm:text-sm rounded-full px-3 sm:px-6 transition-all ${
                        view === "requests"
                          ? "bg-[#0F4D3F] border-[#0F4D3F] text-white"
                          : "border-[#E8E1D5] bg-white text-[#183028] hover:bg-[#FBFAF7]"
                      }`}
                    >
                      <ClipboardList className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                      Organizer Requests
                    </Button>

                    <Button
                      variant="outline"
                      onClick={refreshUsers}
                      className="h-[38px] sm:h-[46px] text-xs sm:text-sm rounded-full border-[#E8E1D5] px-4"
                    >
                      <RefreshCcw className="mr-2 h-3.5 w-3.5 shrink-0" />
                      Refresh
                    </Button>
                  </div>
                </div>

                {/* RESPONSIVE CONTENT */}
                {view === "users" ? (
                  <UsersTable
                    users={filteredUsers}
                    hasAnyUsers={users.length > 0}
                    onOpenDialog={openDialog}
                  />
                ) : (
                  <OrganizerRequests
                    requests={filteredRequests}
                    hasAnyRequests={organizerRequests.length > 0}
                    onReview={openReviewDialog}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      <footer className="border-t border-[#E8E1D5] bg-[#FAF8F4] py-6 w-full overflow-hidden">
        <div className="mx-auto flex flex-col sm:flex-row items-center justify-center text-center gap-2 sm:gap-3 px-4 text-xs sm:text-sm text-[#5E665F] w-full min-w-0">
          <ShieldCheck className="h-5 w-5 text-[#183028] shrink-0" />
          <span className="truncate max-w-full">© 2026 EventSphere. All rights reserved.</span>
        </div>
      </footer>

      {/* DIALOG MODAL — ROLE CHANGE */}
      <RoleChangeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedUser={selectedUser}
        targetRole={targetRole}
        saving={saving}
        onConfirm={confirmRoleChange}
      />

      {/* DIALOG MODAL — ORGANIZER REQUEST REVIEW */}
      <OrganizerReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        selectedRequest={selectedRequest}
        reviewStep={reviewStep}
        setReviewStep={setReviewStep}
        rejectRemark={rejectRemark}
        setRejectRemark={setRejectRemark}
        reviewSubmitting={reviewSubmitting}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
      />
    </div>
  );
}