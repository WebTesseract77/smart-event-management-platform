import React from "react";

export type RoleType = "Administrator" | "Organizer" | "User";

interface RoleBadgeProps {
  role: RoleType;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const base = "text-sm px-3 py-1 rounded-full font-medium";
  if (role === "Administrator") {
    const className = `${base} bg-[color:var(--primary)] text-white`;
    return React.createElement("span", { className }, role);
  }

  if (role === "Organizer") {
    const className = `${base} border border-[color:var(--primary)] text-[color:var(--primary-foreground)] bg-transparent`;
    return React.createElement("span", { className }, role);
  }

  const className = `${base} bg-white/3 text-[color:var(--secondary-foreground)]`;
  return React.createElement("span", { className }, role);
}
