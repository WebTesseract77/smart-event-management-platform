import { CheckCircle2, XCircle, Clock, type LucideIcon } from "lucide-react";

export function getInitials(name?: string) {
  const value = String(name || "U").trim();
  if (!value) return "U";

  const parts = value.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "U";
  const second = parts[1]?.[0] || parts[0]?.[1] || "";
  return `${first}${second}`.toUpperCase();
}

export function normalizeRole(role?: string) {
  const value = String(role || "").trim().toLowerCase();
  if (value === "participant") return "user";
  return value;
}

export function roleTone(role?: string) {
  const value = normalizeRole(role);
  if (value === "admin") return "bg-[#F5F2EA] text-[#183028]";
  if (value === "organizer") return "bg-[#F5F2EA] text-[#183028]";
  return "bg-[#FAF8F4] text-[#5E665F]";
}

export function roleLabel(role?: string) {
  const value = normalizeRole(role);
  if (value === "admin") return "Administrator";
  if (value === "organizer") return "Organizer";
  return "User";
}

export function requestStatusTone(status?: string) {
  if (status === "approved") return "bg-[#ECF7EE] text-[#0F4D3F] border-[#D1ECD5]";
  if (status === "rejected") return "bg-[#FDECEC] text-[#B42318] border-[#FCDEDE]";
  return "bg-[#FFF6E7] text-[#A9771E] border-[#FCECD3]";
}

export function requestStatusLabel(status?: string) {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

export function requestStatusIcon(status?: string): LucideIcon {
  if (status === "approved") return CheckCircle2;
  if (status === "rejected") return XCircle;
  return Clock;
}

export function formatSubmittedDate(raw?: string) {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
    });
  } catch {
    return "—";
  }
}