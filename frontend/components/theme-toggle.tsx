"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } =
    useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() =>
        setTheme(
          theme === "dark"
            ? "light"
            : "dark"
        )
      }
      className="h-12 w-12 rounded-full border border-[#E8E1D5] bg-white text-[#183028] shadow-sm transition-all hover:bg-[#F5F2EA]"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
