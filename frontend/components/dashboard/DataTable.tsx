"use client";
import React from "react";
import RoleBadge, { RoleType } from "@/components/dashboard/RoleBadge";
import ActionButton from "@/components/dashboard/ActionButton";

export interface UserRow {
  id: number;
  name: string;
  email: string;
  role: RoleType;
}

const sample: UserRow[] = [
  { id: 1, name: "Admin User", email: "admin@eventsphere.com", role: "Administrator" },
  { id: 2, name: "ashish", email: "ashishmadhavchourhary@gmail.com", role: "Organizer" },
];

export default function DataTable() {
  return (
    <div className="bg-[color:var(--card)] rounded-[18px] p-6 border overflow-x-auto" style={{ borderColor: "var(--border)" }}>
      <table className="min-w-full table-auto">
        <thead className="sticky top-0 bg-[color:var(--card)]">
          <tr className="text-left text-[color:var(--secondary-foreground)] text-sm">
            <th className="py-3 pl-2">User</th>
            <th className="py-3">Email</th>
            <th className="py-3">Role</th>
            <th className="py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/2">
          {sample.map((u) => (
            <tr key={u.id} className={`hover:bg-white/2 transition-colors`}>
              <td className="py-4 pl-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/4 flex items-center justify-center font-semibold">{u.name.split(" ")[0].slice(0,2).toUpperCase()}</div>
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-[color:var(--muted)] text-sm">ID #{u.id}</div>
                  </div>
                </div>
              </td>
              <td className="py-4">{u.email}</td>
              <td className="py-4">
                <RoleBadge role={u.role} />
              </td>
              <td className="py-4">
                <ActionButton aria-label={`Demote ${u.name}`}>Demote to User</ActionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
