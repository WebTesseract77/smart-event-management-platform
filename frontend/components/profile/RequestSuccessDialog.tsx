"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface RequestSuccessDialogProps {
  onDone: () => void;
}

export default function RequestSuccessDialog({ onDone }: RequestSuccessDialogProps) {
  return (
    <div className="w-full p-8 sm:p-12 flex flex-col items-center text-center justify-center space-y-6 bg-white rounded-[32px]">
     <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF7F2]">
    <span className="text-5xl">🎉</span>
</div>
      
      <div className="space-y-2 max-w-md">
        <h3 className="font-serif text-2xl font-semibold tracking-tight text-[#183028]">
          Organizer Request Submitted
        </h3>
        <p className="text-sm text-[#5E665F] leading-relaxed">
          Your application has been submitted successfully.We'll notify you by email once a decision has been made.
        </p>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] p-5 text-left text-xs text-[#183028] space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-bold uppercase text-[10px] text-[#7C8B83] tracking-wider">Status</span>
          <span className="text-xs font-semibold text-[#A9771E] bg-[#FFF6E7] border border-[#FCECD3] px-2.5 py-0.5 rounded-full">
            Pending Review
          </span>
        </div>
        <p className="font-medium text-[#5E665F] mt-1">
          <strong className="text-[#183028]">Estimated review time:</strong> 1–3 business days. You'll receive an email once your application has been reviewed.
        </p>
      </div>

      <Button
        onClick={onDone}
        className="rounded-full bg-[#0F4D3F] px-10 py-2.5 text-xs font-semibold text-white hover:bg-[#0A352B] transition-colors min-w-[120px]"
      >
        Done
      </Button>
    </div>
  );
}