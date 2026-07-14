"use client";

import React from "react";
import { motion } from "framer-motion";

interface ApplicationTimelineProps {
  status: "pending" | "approved" | "rejected";
}

export default function ApplicationTimeline({ status }: ApplicationTimelineProps) {
  const stepsConfig = {
    pending: [
      { label: "Submitted", check: "✔", color: "text-[#0F4D3F]", dotBg: "bg-[#0F4D3F]" },
      { label: "Under Review", check: "🟡", color: "text-[#A9771E]", dotBg: "bg-[#A9771E]" },
      { label: "Decision", check: "○", color: "text-[#7C8B83]", dotBg: "bg-white border-[#E8E1D5]" },
      { label: "Organizer Access", check: "○", color: "text-[#7C8B83]", dotBg: "bg-white border-[#E8E1D5]" },
    ],
    approved: [
      { label: "Submitted", check: "✔", color: "text-[#0F4D3F]", dotBg: "bg-[#0F4D3F]" },
      { label: "Under Review", check: "✔", color: "text-[#0F4D3F]", dotBg: "bg-[#0F4D3F]" },
      { label: "Approved", check: "🟢", color: "text-[#0F4D3F]", dotBg: "bg-[#0F4D3F]" },
      { label: "Organizer Access", check: "✔", color: "text-[#0F4D3F]", dotBg: "bg-[#0F4D3F]" },
    ],
    rejected: [
      { label: "Submitted", check: "✔", color: "text-[#0F4D3F]", dotBg: "bg-[#0F4D3F]" },
      { label: "Rejected", check: "🔴", color: "text-[#B42318]", dotBg: "bg-[#B42318]" },
      { label: "Decision", check: "○", color: "text-[#7C8B83]", dotBg: "bg-white border-[#E8E1D5]" },
      { label: "Organizer Access", check: "○", color: "text-[#7C8B83]", dotBg: "bg-white border-[#E8E1D5]" },
    ],
  };

  const steps = stepsConfig[status] || stepsConfig.pending;

  return (
    <div className="mt-4 pt-4 border-t border-[#E8E1D5] space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C8B83]">
        Application Timeline
      </p>
      <div className="relative flex items-center justify-between w-full px-2">
        <div className="absolute top-[7px] left-4 right-4 h-[2px] bg-[#E8E1D5] -z-10" />
        
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center space-y-1.5">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1, ease: "easeOut" }}
              className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold ${step.dotBg}`}
            >
              {step.check !== "🟢" && step.check !== "🔴" && step.check !== "🟡" && step.check !== "○" && "✓"}
            </motion.div>
            <span className={`text-[10px] font-bold tracking-tight ${step.color}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}