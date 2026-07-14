"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getAdminUsers,
  getAdminOrganizerRequests,
  getCurrentUser,
  updateUserRole,
  reviewOrganizerRequest,
  AdminOrganizerRequestItem,
} from "@/lib/api";
import { normalizeRole } from "../utils/adminUsersUtils";

export type RoleFilter = "all" | "admin" | "organizer" | "user";
export type AdminView = "users" | "requests";
export type ReviewStep = "details" | "confirm-approve" | "reject";

export function useAdminUsers() {
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [targetRole, setTargetRole] = useState<"user" | "organizer" | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  // --- Organizer Requests tab state ---
  const [view, setView] = useState<AdminView>("users");
  const [organizerRequests, setOrganizerRequests] = useState<AdminOrganizerRequestItem[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AdminOrganizerRequestItem | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewStep, setReviewStep] = useState<ReviewStep>("details");
  const [rejectRemark, setRejectRemark] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const user = await getCurrentUser(token);

        if (user.role !== "admin") {
          window.alert("Access denied.");
          router.push("/events");
          return;
        }

        const data = await getAdminUsers(token);
        setUsers(Array.isArray(data) ? data : []);

        try {
          const requests = await getAdminOrganizerRequests(token);
          setOrganizerRequests(Array.isArray(requests) ? requests : []);
        } catch (requestsErr) {
          // Non-blocking: the users table should still work even if
          // organizer requests fail to load.
          console.error(requestsErr);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load users right now.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return users.filter((user) => {
      const text = `${user.name || ""} ${user.email || ""} ${normalizeRole(user.role)}`.toLowerCase();
      if (!text.includes(normalizedSearch)) return false;
      if (roleFilter === "all") return true;
      return normalizeRole(user.role) === roleFilter;
    });
  }, [users, search, roleFilter]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return organizerRequests.filter((request) => {
      const text = `${request.name || ""} ${request.email || ""}`.toLowerCase();
      return text.includes(normalizedSearch);
    });
  }, [organizerRequests, search]);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((user) => normalizeRole(user.role) === "admin").length,
    organizers: users.filter((user) => normalizeRole(user.role) === "organizer").length,
    pendingRequests: organizerRequests.filter((r) => r.status === "pending").length,
  }), [users, organizerRequests]);

  async function refreshUsers() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const data = await getAdminUsers(token);
    setUsers(Array.isArray(data) ? data : []);

    try {
      const requests = await getAdminOrganizerRequests(token);
      setOrganizerRequests(Array.isArray(requests) ? requests : []);
    } catch (err) {
      console.error(err);
    }
  }

  function openDialog(user: any, role: "user" | "organizer") {
    setSelectedUser(user);
    setTargetRole(role);
    setDialogOpen(true);
  }

  function openReviewDialog(request: AdminOrganizerRequestItem) {
    setSelectedRequest(request);
    setReviewStep("details");
    setRejectRemark("");
    setReviewDialogOpen(true);
  }

  async function handleApproveRequest() {
    if (!selectedRequest || reviewSubmitting) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    setReviewSubmitting(true);
    try {
      await reviewOrganizerRequest(token, selectedRequest.id, {
        status: "approved",
      });
      toast.success(`${selectedRequest.name || "this applicant"} is now an Organizer`);
      await refreshUsers();
      setReviewDialogOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to approve request");
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function handleRejectRequest() {
    if (!selectedRequest || reviewSubmitting || !rejectRemark.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    setReviewSubmitting(true);
    try {
      await reviewOrganizerRequest(token, selectedRequest.id, {
        status: "rejected",
        admin_remark: rejectRemark.trim(),
      });
      toast.success("Organizer request rejected");
      await refreshUsers();
      setReviewDialogOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to reject request");
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function confirmRoleChange() {
    if (!selectedUser || !targetRole || saving) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    setSaving(true);
    try {
      await updateUserRole(token, selectedUser.id, targetRole);
      toast.success(
        targetRole === "organizer"
          ? `${selectedUser.name || "User"} promoted to Organizer`
          : `${selectedUser.name || "User"} demoted to User`
      );
      await refreshUsers();
      setDialogOpen(false);
      setSelectedUser(null);
      setTargetRole(null);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setSaving(false);
    }
  }

  return {
    // users tab
    users,
    loading,
    saving,
    error,
    selectedUser,
    targetRole,
    dialogOpen,
    setDialogOpen,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    filteredUsers,
    stats,
    openDialog,
    confirmRoleChange,

    // view toggle
    view,
    setView,

    // organizer requests tab
    organizerRequests,
    filteredRequests,
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
  };
}