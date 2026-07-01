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
  const content = (
    <Card className="rounded-3xl border bg-background shadow-sm">
      <CardContent className="flex flex-col items-center p-8 text-center sm:p-10">
        <div className="mb-5 rounded-2xl bg-violet-100 p-4 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
          {icon}
        </div>
        <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        {actionLabel && actionHref ? (
          <Button className="mt-6 rounded-full px-5" asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {content}
    </motion.div>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted/70 ${className}`} />;
}

export function PageHeaderSkeleton() {
  return (
    <div className="rounded-[2rem] border bg-background/80 p-6 shadow-sm sm:p-8">
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="mt-4 h-10 w-72" />
      <SkeletonBlock className="mt-3 h-5 w-[28rem] max-w-full" />
    </div>
  );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="min-h-[160px] rounded-3xl border bg-background shadow-sm">
          <CardContent className="flex h-full flex-col justify-between p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="mt-3 h-9 w-16" />
              </div>
              <SkeletonBlock className="h-12 w-12 rounded-2xl" />
            </div>
            <SkeletonBlock className="mt-6 h-4 w-36" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
