"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function EventCardSkeleton() {
  return (
    <Card className="group h-full overflow-hidden rounded-[24px] border border-[#E8E1D5] bg-white shadow-sm">
      <div className="aspect-[16/10] animate-pulse bg-gradient-to-br from-[#F5F2EA] to-[#E8E1D5]" />
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-5 w-3/4 rounded-full bg-[#F5F2EA]" />
            <div className="h-4 w-full rounded-full bg-[#F5F2EA]" />
            <div className="h-4 w-5/6 rounded-full bg-[#F5F2EA]" />
          </div>
          <div className="h-8 w-20 rounded-full bg-[#F5F2EA]" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-10 rounded-2xl bg-[#F5F2EA]" />
          <div className="h-10 rounded-2xl bg-[#F5F2EA]" />
          <div className="h-10 rounded-2xl bg-[#F5F2EA]" />
          <div className="h-10 rounded-2xl bg-[#F5F2EA]" />
        </div>
        <div className="flex gap-3">
          <div className="h-11 flex-1 rounded-full bg-[#F5F2EA]" />
          <div className="h-11 w-24 rounded-full bg-[#F5F2EA]" />
        </div>
      </CardContent>
    </Card>
  );
}
