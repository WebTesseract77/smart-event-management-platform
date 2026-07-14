"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RoleChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: any;
  targetRole: "user" | "organizer" | null;
  saving: boolean;
  onConfirm: () => void;
}

export function RoleChangeDialog({
  open,
  onOpenChange,
  selectedUser,
  targetRole,
  saving,
  onConfirm,
}: RoleChangeDialogProps) {
  const dialogTitle =
    targetRole === "organizer"
      ? `Promote ${selectedUser?.name || "this user"} to Organizer?`
      : `Demote ${selectedUser?.name || "this user"} to User?`;

  const dialogDescription =
    targetRole === "organizer"
      ? "This user will gain permission to create and manage their own events."
      : "This user will lose organizer capabilities and return to standard user access.";

  const dialogConfirmLabel = targetRole === "organizer" ? "Promote" : "Demote";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
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
            onClick={onConfirm}
            disabled={saving}
          >
            {dialogConfirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}