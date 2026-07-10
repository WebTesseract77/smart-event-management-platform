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
  <header
    className="
      sticky
      top-0
      z-40

      flex
      h-[72px]
      sm:h-[88px]

      items-center
      justify-between

      border-b
      border-[#E8E1D5]

      bg-[#FAF8F4]/90
      backdrop-blur-md

      px-4
      sm:px-8
    "
  >
    {/* MENU */}
    <button
      type="button"
      onClick={onMenuClick}
      className="
        flex
        h-11
        w-11

        items-center
        justify-center

        rounded-full

        border
        border-[#E8E1D5]

        bg-white

        text-[#183028]

        shadow-sm

        xl:hidden
      "
    >
      <Menu className="h-5 w-5" />
    </button>


    {/* MOBILE LOGO */}
    <div className="xl:hidden">
      <h1 className="text-[17px] font-bold leading-none">
        <span className="text-[#0F4D3F]">
          Event
        </span>

        <span className="text-[#C6922F]">
          Sphere
        </span>
      </h1>

      <p className="mt-1 text-[10px] text-[#C6922F]">
        Event Management
      </p>
    </div>


    {/* USER */}
    <div
      className="
        flex

        items-center

        rounded-full

        border
        border-[#E8E1D5]

        bg-white

        p-1

        shadow-sm
      "
    >
      <div
        className="
          flex

          h-10
          w-10

          items-center
          justify-center

          rounded-full

          bg-[#0F4D3F]

          text-sm
          font-bold
          text-white
        "
      >
        {initials}
      </div>


      <div className="hidden px-3 leading-tight sm:block">
        <p className="text-sm font-semibold text-[#183028]">
          {name}
        </p>

        <p className="text-xs text-[#5E665F]">
          {roleLabel}
        </p>
      </div>

    </div>

  </header>
);
}