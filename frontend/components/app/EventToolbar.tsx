"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type EventToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  counts: {
    all: number;
    upcoming: number;
    ongoing: number;
    ended: number;
  };
};

const filters = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "ongoing", label: "Ongoing" },
  { key: "ended", label: "Ended" },
];

export default function EventToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  counts,
}: EventToolbarProps) {
  return (
    <div className="sticky top-20 z-20 mb-8 rounded-[2rem] border bg-background/80 p-4 shadow-lg shadow-violet-500/5 backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-14 w-full rounded-2xl border bg-background/80 pl-12 pr-4 text-sm shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/70 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((item) => (
            <Button
              key={item.key}
              size="sm"
              variant={filter === item.key ? "default" : "outline"}
              onClick={() => onFilterChange(item.key)}
              className="rounded-full px-4 transition-all duration-300 hover:-translate-y-0.5"
            >
              {item.label} ({counts[item.key as keyof typeof counts]})
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
