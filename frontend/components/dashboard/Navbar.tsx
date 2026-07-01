"use client";
import React from "react";
import { Menu, Sun, Bell } from "lucide-react";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between gap-4 py-4 px-6 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
      <div className="flex items-center gap-3">
        <button aria-label="Open menu" className="p-2 rounded-md hover:bg-white/2 focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]">
          <Menu className="w-5 h-5 text-[color:var(--muted)]" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button aria-label="Toggle theme" className="p-2 rounded-md hover:bg-white/2 focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]">
          <Sun className="w-5 h-5 text-[color:var(--muted)]" />
        </button>

        <button aria-label="Notifications" className="p-2 rounded-md hover:bg-white/2 focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]">
          <Bell className="w-5 h-5 text-[color:var(--muted)]" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[color:var(--primary)] flex items-center justify-center text-white">AU</div>
        </div>
      </div>
    </header>
  );
}
