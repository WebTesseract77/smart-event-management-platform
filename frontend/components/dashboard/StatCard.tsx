"use client";
import React, { ReactNode } from "react";
import { motion } from "framer-motion";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
}

export default function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[color:var(--card)] rounded-[18px] p-6 border"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white/3 flex items-center justify-center text-[color:var(--primary-foreground)]">
            {icon}
          </div>
          <div>
            <div className="text-sm text-[color:var(--secondary-foreground)]">{label}</div>
            <div className="text-2xl font-semibold">{value}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
