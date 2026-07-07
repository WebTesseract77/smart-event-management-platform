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
    <div className="sticky top-16 z-20 mb-6 rounded-[24px] border border-[#E8E1D5] bg-white p-4 shadow-[0_12px_32px_rgba(15,77,63,0.05)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5E665F]" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-[14px] border border-[#E8E1D5] bg-[#FAF8F4] pl-12 pr-4 text-sm text-[#183028] outline-none transition-all placeholder:text-[#8A918B] focus:border-[#0F4D3F] focus:ring-2 focus:ring-[#0F4D3F]/15"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((item) => {
            const active = filter === item.key;

            return (
              <Button
                key={item.key}
                variant="outline"
                size="sm"
                onClick={() => onFilterChange(item.key)}
                className={
                  active
                    ? "h-10 rounded-full border-[#0F4D3F] bg-[#0F4D3F] px-4 text-sm text-white shadow-sm hover:bg-[#0B3E33]"
                    : "h-10 rounded-full border-[#E8E1D5] bg-white px-4 text-sm text-[#183028] shadow-sm hover:bg-[#F5F2EA]"
                }
              >
                {item.label}

                <span className={`ml-2 rounded-full bg-[#FFF6E7] px-2 py-0.5 text-[0.72rem] ${active ? "bg-white/15 text-white" : "text-[#A9771E]"}`}>
                  {counts[item.key as keyof typeof counts]}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
