"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { getCurrentUser } from "@/lib/api";

type TopbarProps = {
  onMenuClick: () => void;
};

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const data = await getCurrentUser(token);
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    }
    loadUser();
  }, []);

  const name = user?.username || user?.name || "User";
  const role = user?.role || "participant";

  const initials = name
    .split(" ")
    .map((x: string) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel =
    role === "admin"
      ? "Administrator"
      : role === "organizer"
      ? "Organizer"
      : "Participant";

  return (
    <header className="sticky top-0 z-30 flex h-[88px] items-center justify-between border-b border-[#E8E1D5] bg-[#FAF8F4] px-8">
      {/* Hidden completely on Desktop, visible on mobile layouts */}
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-[48px] w-[48px] items-center justify-center rounded-full border border-[#E8E1D5] bg-white text-[#183028] shadow-[0_6px_16px_rgba(24,48,40,0.10)] hover:bg-[#F5F2EA] xl:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="ml-auto flex h-[58px] items-center gap-3 rounded-full border border-[#E8E1D5] bg-white px-3 pr-5 shadow-[0_8px_24px_rgba(24,48,40,0.12)]">
        <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#0F4D3F] text-[15px] font-bold text-white">
          {initials}
        </div>

        <div className="hidden leading-tight sm:block">
          <p className="text-[15px] font-semibold text-[#183028]">{name}</p>
          <p className="mt-1 text-[12px] text-[#5E665F]">{roleLabel}</p>
        </div>
      </div>
    </header>
  );
}