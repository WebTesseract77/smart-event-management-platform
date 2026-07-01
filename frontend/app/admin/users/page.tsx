"use client";
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
  if (value === "admin") return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
  if (value === "organizer") return "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300";
  return "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300";
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
          <div className="h-10 w-10 rounded-full bg-muted/70" />
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
      <div className="min-h-screen bg-muted/30 p-6 sm:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <PageHeaderSkeleton />
          <Card className="rounded-[2rem] border bg-background/80 shadow-sm backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-3xl bg-muted/60" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border bg-background/80 shadow-sm backdrop-blur-sm">
            <CardContent className="p-0">
              <Table>
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
      <div className="min-h-screen bg-muted/30 p-6 sm:p-8">
        <div className="mx-auto max-w-7xl">
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
    <div className="min-h-screen bg-muted/30">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.09),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.1),transparent_30%)]" />
        <motion.div
          className="mx-auto max-w-7xl px-6 py-8 sm:py-10 lg:py-12"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.7)_100%)] shadow-2xl shadow-violet-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.86)_0%,rgba(24,24,27,0.6)_100%)]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-3xl">
                    <p className="inline-flex items-center gap-2 rounded-full border bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Admin user management
                    </p>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                      Manage users
                    </h1>
                    <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
                      Promote trusted users to organizers or demote organizers back to user access.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border bg-background/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Total users</p>
                      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="rounded-2xl border bg-background/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Admins</p>
                      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{stats.admins}</p>
                    </div>
                    <div className="rounded-2xl border bg-background/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Organizers</p>
                      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{stats.organizers}</p>
                    </div>
                    <div className="rounded-2xl border bg-background/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Users</p>
                      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{stats.users}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border bg-background/80 shadow-sm backdrop-blur-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="pr-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-14">
                          <EmptyState
                            icon={<Users className="h-5 w-5" />}
                            title="No users found"
                            description="User accounts will appear here once they register."
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => {
                        const normalizedRole = normalizeRole(user.role);
                        const isAdmin = normalizedRole === "admin";
                        const canPromote = normalizedRole === "user";
                        const canDemote = normalizedRole === "organizer";

                        return (
                          <TableRow key={user.id} className="transition-colors hover:bg-muted/40">
                            <TableCell className="pl-6">
                              <div className="flex items-center gap-3">
                                <Avatar size="lg" className="h-11 w-11 border border-white/70 bg-violet-50 text-violet-700 dark:border-white/10 dark:bg-violet-500/15 dark:text-violet-200">
                                  <AvatarFallback className="bg-transparent text-sm font-semibold text-current">
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-slate-950 dark:text-white">{user.name}</p>
                                  <p className="mt-1 text-sm text-muted-foreground">ID #{user.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <Mail className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`rounded-full px-3 py-1 text-[11px] font-medium ${roleTone(normalizedRole)}`}>
                                {roleLabel(user.role)}
                              </Badge>
                            </TableCell>
                            <TableCell className="pr-6 text-right">
                              {isAdmin ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full border-slate-200/80 bg-slate-100 px-4 text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
                                  disabled
                                  aria-disabled="true"
                                >
                                  Administrator
                                </Button>
                              ) : canPromote ? (
                                <Button
                                  size="sm"
                                  className="rounded-full bg-violet-600 px-4 text-white shadow-lg shadow-violet-600/20 hover:bg-violet-500"
                                  onClick={() => openDialog(user, "organizer")}
                                >
                                  <UserRoundCheck className="mr-2 h-4 w-4" />
                                  Promote to Organizer
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full border-violet-200/80 bg-white px-4 shadow-sm hover:border-violet-300 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                                  onClick={() => openDialog(user, "user")}
                                >
                                  <UserRoundX className="mr-2 h-4 w-4" />
                                  Demote to User
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.9)_100%)] p-6 shadow-2xl shadow-violet-500/15 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.96)_0%,rgba(24,24,27,0.92)_100%)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              {dialogTitle}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
              {dialogDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 border-t border-white/70 bg-transparent px-0 pb-0 pt-4 dark:border-white/10">
            <Button
              variant="outline"
              className="rounded-full border-violet-200/80 bg-white px-5 shadow-sm hover:border-violet-300 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full bg-violet-600 px-5 text-white shadow-lg shadow-violet-600/20 hover:bg-violet-500"
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
