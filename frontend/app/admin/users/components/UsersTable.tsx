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
import { Users, Mail, UserRoundCheck, UserRoundX } from "lucide-react";
import { getInitials, normalizeRole, roleTone, roleLabel } from "../utils/adminUsersUtils";

interface UsersTableProps {
  users: any[];
  hasAnyUsers: boolean;
  onOpenDialog: (user: any, role: "user" | "organizer") => void;
}

export function UsersTable({ users, hasAnyUsers, onOpenDialog }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="py-12 border border-dashed rounded-[22px] border-[#E8E1D5] w-full">
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title={hasAnyUsers ? "No matches" : "No users found"}
          description={
            hasAnyUsers
              ? "Try adjusting your search or filters."
              : "User accounts will appear here once they register."
          }
        />
      </div>
    );
  }

  return (
    <>
      {/* MOBILE STACKED CARD VIEW */}
      <div className="grid gap-4 md:hidden w-full min-w-0">
        {users.map((user) => {
          const normalizedRole = normalizeRole(user.role);
          const isAdmin = normalizedRole === "admin";
          const canPromote = normalizedRole === "user";

          return (
            <div key={user.id} className="p-3 sm:p-4 rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4]/50 space-y-4 w-full min-w-0">
              <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2 w-full min-w-0">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <Avatar className="h-11 w-11 shrink-0 border border-[#E8E1D5] bg-[#0F4D3F] text-white shadow-sm">
                    <AvatarFallback className="bg-transparent text-xs font-semibold text-current">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-[#183028]">{user.name}</p>
                  </div>
                </div>
                <Badge className={`rounded-full border border-[#E8E1D5] px-2.5 py-1 text-[11px] font-semibold shrink-0 sm:whitespace-nowrap ${roleTone(normalizedRole)}`}>
                  {roleLabel(user.role)}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#5E665F] min-w-0 w-full">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#C6922F]" />
                <span className="truncate break-all flex-1 min-w-0">{user.email}</span>
              </div>

              <div className="pt-3 border-t border-[#E8E1D5]/60 flex justify-end w-full min-w-0">
                {isAdmin ? (
                  <Button size="sm" variant="outline" className="w-full h-9 rounded-full bg-[#F5F2EA] text-xs text-[#5E665F] flex items-center justify-center px-4" disabled>
                    Administrator
                  </Button>
                ) : canPromote ? (
                  <Button size="sm" className="w-full h-9 rounded-full bg-[#0F4D3F] text-xs text-white hover:bg-[#0B3E33] flex items-center justify-center px-4" onClick={() => onOpenDialog(user, "organizer")}>
                    <UserRoundCheck className="mr-1.5 h-3.5 w-3.5 shrink-0" /> Promote
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="w-full h-9 rounded-full border-[#C6922F] text-xs bg-white text-[#183028] flex items-center justify-center px-4" onClick={() => onOpenDialog(user, "user")}>
                    <UserRoundX className="mr-1.5 h-3.5 w-3.5 shrink-0" /> Demote
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block w-full overflow-hidden">
        <Table className="overflow-hidden rounded-[22px] w-full">
          <TableHeader className="border-b border-[#E8E1D5]">
            <TableRow className="border-b border-[#E8E1D5]">
              <TableHead className="pl-6 py-4 text-[0.95rem] font-medium text-[#5E665F]">User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const normalizedRole = normalizeRole(user.role);
              const isAdmin = normalizedRole === "admin";
              const canPromote = normalizedRole === "user";

              return (
                <TableRow key={user.id} className="transition-colors hover:bg-[#FBFAF7]">
                  <TableCell className="pl-6 py-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 border border-[#E8E1D5] bg-[#0F4D3F] text-white shadow-sm shrink-0">
                        <AvatarFallback className="bg-transparent text-xs font-semibold text-current">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-[#183028]">{user.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-2 text-[0.92rem] text-[#5E665F]">
                      <Mail className="h-4 w-4 shrink-0 text-[#C6922F]" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <Badge className={`rounded-full border border-[#E8E1D5] px-3 py-1.5 text-xs font-semibold ${roleTone(normalizedRole)}`}>
                      {roleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 py-5 text-right">
                    {isAdmin ? (
                      <Button size="sm" variant="outline" className="h-10 rounded-full border-[#E8E1D5] bg-[#F5F2EA] px-4 text-xs text-[#5E665F]" disabled aria-disabled="true">
                        Administrator
                      </Button>
                    ) : canPromote ? (
                      <Button size="sm" className="h-10 rounded-full bg-[#0F4D3F] px-4 text-xs text-white hover:bg-[#0B3E33]" onClick={() => onOpenDialog(user, "organizer")}>
                        <UserRoundCheck className="mr-2 h-4 w-4 shrink-0" /> Promote
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="h-10 rounded-full border-[#C6922F] bg-white px-4 text-xs hover:bg-[#FBFAF7]" onClick={() => onOpenDialog(user, "user")}>
                        <UserRoundX className="mr-2 h-4 w-4 shrink-0" /> Demote
                      </Button>
                    )}
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