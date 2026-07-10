"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";

import {
  getAdminUsers,
  getCurrentUser,
  updateUserRole,
} from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EmptyState,
  PageHeaderSkeleton,
} from "@/components/app/FeedbackStates";
import {
  ShieldCheck,
  Users,
  Mail,
  AlertCircle,
  UserRoundCheck,
  UserRoundX,
  UserStar,
  User,
  Search,
  RefreshCcw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function getInitials(name?: string) {
  const value = String(name || "U").trim();
  if (!value) return "U";

  const parts = value.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "U";
  const second = parts[1]?.[0] || parts[0]?.[1] || "";
  return `${first}${second}`.toUpperCase();
}

function normalizeRole(role?: string) {
  const value = String(role || "").trim().toLowerCase();
  if (value === "participant") return "user";
  return value;
}

function roleTone(role?: string) {
  const value = normalizeRole(role);
  if (value === "admin") return "bg-[#F5F2EA] text-[#183028]";
  if (value === "organizer") return "bg-[#F5F2EA] text-[#183028]";
  return "bg-[#FAF8F4] text-[#5E665F]";
}

function roleLabel(role?: string) {
  const value = normalizeRole(role);
  if (value === "admin") return "Administrator";
  if (value === "organizer") return "Organizer";
  return "User";
}

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
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [targetRole, setTargetRole] = useState<"user" | "organizer" | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "organizer" | "user">("all");

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

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((user) => normalizeRole(user.role) === "admin").length,
    organizers: users.filter((user) => normalizeRole(user.role) === "organizer").length,
    users: users.filter((user) => normalizeRole(user.role) === "user").length,
  }), [users]);

  async function refreshUsers() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const data = await getAdminUsers(token);
    setUsers(Array.isArray(data) ? data : []);
  }

  function openDialog(user: any, role: "user" | "organizer") {
    setSelectedUser(user);
    setTargetRole(role);
    setDialogOpen(true);
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
      await updateUserRole(token, Number(selectedUser.id), targetRole);
      toast.success(
        `${selectedUser.name || "User"} ${targetRole === "organizer" ? "promoted to Organizer" : "demoted to User"}`
      );
      await refreshUsers();
      setDialogOpen(false);
      setSelectedUser(null);
      setTargetRole(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update role");
    } finally {
      setSaving(false);
    }
  }

  const dialogTitle =
    targetRole === "organizer"
      ? `Promote ${selectedUser?.name || "this user"} to Organizer?`
      : `Demote ${selectedUser?.name || "this user"} to User?`;

  const dialogDescription =
    targetRole === "organizer"
      ? "This user will gain permission to create and manage their own events."
      : "This user will lose organizer capabilities and return to standard user access.";

  const dialogConfirmLabel = targetRole === "organizer" ? "Promote" : "Demote";

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
            <Card className="overflow-hidden rounded-[24px] md:rounded-[34px] border border-[#E8E1D5] bg-white shadow-[0_12px_28px_rgba(24,48,40,.05)] w-full">
              <CardContent className="p-5 sm:p-10 w-full">
                <div className="grid lg:grid-cols-[420px_1fr] items-center gap-6 lg:gap-12 w-full">
                  
                  {/* LEFT */}
                  <div className="max-w-[480px] w-full">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E1D5] bg-[#F8F6EF] px-4 py-2 text-xs sm:text-sm font-medium text-[#183028]">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      Admin user management
                    </div>

                    <h1 className="mt-4 sm:mt-7 font-serif text-3xl sm:text-4xl lg:text-[3.2rem] lg:leading-[0.92] tracking-[-0.05em] text-[#183028]">
                      Manage users
                    </h1>

                    <p className="mt-3 sm:mt-7 text-sm sm:text-[18px] sm:leading-8 text-[#5E665F]">
                      Promote trusted users to organizers or demote organizers back to standard user access.
                    </p>
                  </div>

                  {/* RIGHT */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
                    {[
                      { label: "TOTAL USERS", value: stats.total, icon: Users },
                      { label: "ADMINS", value: stats.admins, icon: ShieldCheck },
                      { label: "ORGANIZERS", value: stats.organizers, icon: UserStar },
                      { label: "USERS", value: stats.users, icon: User },
                    ].map(({ label, value, icon: Icon }) => (
                      <div
                        key={label}
                        className="h-[140px] sm:h-[170px] rounded-[18px] sm:rounded-[22px] border border-[#E8E1D5] bg-white p-3 sm:p-4 shadow-[0_10px_28px_rgba(24,48,40,.05)] flex flex-col justify-between min-w-0 w-full"
                      >
                        <div className="min-w-0 w-full">
                          <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#EFF2E9] shrink-0">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#183028] shrink-0" />
                          </div>
                          <p className="mt-3 truncate text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] sm:tracking-[0.22em] text-[#7C7C7C] uppercase">
                            {label}
                          </p>
                          <div className="mt-1 h-[2px] w-6 sm:w-8 rounded-full bg-[#C79A38]" />
                        </div>
                        <p className="font-serif font-bold text-2xl sm:text-[28px] leading-none text-[#183028] truncate">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                </div>
              </CardContent>
            </Card>

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
                      placeholder="Search users..."
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
                        onClick={() => setRoleFilter(value as any)}
                        className={`h-[38px] sm:h-[46px] text-xs sm:text-sm rounded-full px-3 sm:px-6 transition-all ${
                          roleFilter === value
                            ? "bg-[#0F4D3F] border-[#0F4D3F] text-white"
                            : "border-[#E8E1D5] bg-white text-[#183028] hover:bg-[#FBFAF7]"
                        }`}
                      >
                        {label}
                      </Button>
                    ))}

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

                {/* RESPONSIVE USERS CONTAINER */}
                {filteredUsers.length === 0 ? (
                  <div className="py-12 border border-dashed rounded-[22px] border-[#E8E1D5] w-full">
                    <EmptyState
                      icon={<Users className="h-5 w-5" />}
                      title={users.length === 0 ? "No users found" : "No matches"}
                      description={users.length === 0 ? "User accounts will appear here once they register." : "Try adjusting your search or filters."}
                    />
                  </div>
                ) : (
                  <>
                    {/* MOBILE STACKED CARD VIEW */}
                    <div className="grid gap-4 md:hidden w-full min-w-0">
                      {filteredUsers.map((user) => {
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
                                <Button size="sm" className="w-full h-9 rounded-full bg-[#0F4D3F] text-xs text-white hover:bg-[#0B3E33] flex items-center justify-center px-4" onClick={() => openDialog(user, "organizer")}>
                                  <UserRoundCheck className="mr-1.5 h-3.5 w-3.5 shrink-0" /> Promote
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="w-full h-9 rounded-full border-[#C6922F] text-xs bg-white text-[#183028] flex items-center justify-center px-4" onClick={() => openDialog(user, "user")}>
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
                          {filteredUsers.map((user) => {
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
                                    <Button size="sm" className="h-10 rounded-full bg-[#0F4D3F] px-4 text-xs text-white hover:bg-[#0B3E33]" onClick={() => openDialog(user, "organizer")}>
                                      <UserRoundCheck className="mr-2 h-4 w-4 shrink-0" /> Promote
                                    </Button>
                                  ) : (
                                    <Button size="sm" variant="outline" className="h-10 rounded-full border-[#C6922F] bg-white px-4 text-xs hover:bg-[#FBFAF7]" onClick={() => openDialog(user, "user")}>
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

      {/* DIALOG MODAL */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-[1.5rem] sm:rounded-[2rem] border border-white/70 bg-white p-5 sm:p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
              {dialogTitle}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
              {dialogDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end border-t pt-4">
           <Button
  variant="outline"
  className="
    rounded-full 
    w-full sm:w-auto 
    border-[#0F4D3F]
    bg-[#FAF8F4]
    px-5 
    text-[#0F4D3F]
    hover:bg-[#EAF3ED]
  "
  onClick={() => setDialogOpen(false)}
  disabled={saving}
>
  Cancel
</Button>

<Button
  className="
    rounded-full 
    w-full sm:w-auto 
    bg-[#0F4D3F]
    px-5 
    text-white
    shadow-[0_8px_20px_rgba(15,77,63,0.25)]
    hover:bg-[#0B3E33]
  "
  onClick={confirmRoleChange}
  disabled={saving}
>
  {dialogConfirmLabel}
</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}