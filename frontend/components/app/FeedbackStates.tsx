"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="overflow-hidden rounded-3xl border border-[#E8E1D5] bg-white shadow-sm">
        <CardContent className="flex flex-col items-center p-10 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#E8E1D5] bg-[#F5F2EA] text-[#0F4D3F] shadow-sm dark:bg-[#1A201D] dark:text-[#C6922F]">
            {icon}
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-[#183028]">
            {title}
          </h2>

          <p className="mt-4 max-w-md text-base leading-7 text-[#5E665F]">
            {description}
          </p>

          {actionLabel && actionHref && (
            <Button
              asChild
              className="mt-8 rounded-[14px] bg-[#0F4D3F] px-6 text-white hover:bg-[#0B3E33]"
            >
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`animate-pulse rounded-2xl bg-[#F5F2EA] ${className}`} />
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="rounded-3xl border border-[#E8E1D5] bg-white p-8 shadow-sm">
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="mt-5 h-10 w-72 max-w-full" />
      <SkeletonBlock className="mt-4 h-5 w-[28rem] max-w-full" />
    </div>
  );
}

export function StatGridSkeleton({
  count = 4,
}: {
  count?: number;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="min-h-[170px] rounded-3xl border border-[#E8E1D5] bg-white shadow-sm">
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="mt-4 h-10 w-20" />
              </div>

              <SkeletonBlock className="h-12 w-12 rounded-2xl" />
            </div>

            <SkeletonBlock className="mt-8 h-4 w-36" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
