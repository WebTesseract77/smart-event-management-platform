"use client";
import React from "react";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function ActionButton({ children, className = "", ...props }: ActionButtonProps) {
  return (
    <button
      {...props}
      className={[
        "px-3 py-1.5 rounded-[14px] text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]",
        "border-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)] hover:text-white",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
