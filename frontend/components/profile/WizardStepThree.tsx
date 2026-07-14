"use client";

import React from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface StepThreeProps {
  formData: { reason: string };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  agreed: boolean;
  setAgreed: (val: boolean) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export default function WizardStepThree({
  formData,
  setFormData,
  agreed,
  setAgreed,
  isSubmitting,
  onSubmit,
  onBack,
}: StepThreeProps) {
  const count = formData.reason.length;
  const isMinReached = count >= 100;
  const isLengthValid = isMinReached && count <= 1000;
  const isFormValid = isLengthValid && agreed;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="font-serif text-xl font-semibold tracking-tight text-[#183028]">Reason</h3>
        <p className="text-xs text-[#5E665F]">
          Provide details regarding why you are applying to host events on our network.
        </p>
      </div>

      <div className="space-y-4 pt-1">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
            <label className="text-[#7C8B83]">Application Statement</label>
            <span className={isMinReached ? "text-[#0F4D3F]" : "text-[#B42318]"}>
              {!isMinReached ? `Minimum 100 characters required (${count}/1000)` : "✓ Minimum requirement reached"}
            </span>
          </div>
          
          <Textarea
            value={formData.reason}
            disabled={isSubmitting}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, reason: e.target.value }))}
            placeholder="Describe your reasoning and event hosting vision..."
            className="min-h-[120px] rounded-xl border-[#E8E1D5] bg-[#FAF8F4] focus-visible:ring-[#0F4D3F] text-sm"
          />
        </div>

        {/* What Happens Next Panel */}
        <div className="rounded-2xl border border-[#E8E1D5] bg-[#FAF8F4] p-4 text-xs space-y-2 text-[#183028]">
          <h4 className="font-bold text-[#0F4D3F] uppercase tracking-wider text-[10px]">What Happens Next?</h4>
          <ul className="space-y-1 list-disc list-inside text-[#5E665F] font-medium">
            <li>Your request is submitted instantly.</li>
            <li>Our administrators manually review every application.</li>
            <li>You'll receive an email once approved or rejected.</li>
            <li>Average review time is 1–3 business days.</li>
          </ul>
        </div>

        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id="wizard-agree"
            checked={agreed}
            disabled={isSubmitting}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[#E8E1D5] accent-[#0F4D3F]"
          />
          <label htmlFor="wizard-agree" className="text-xs text-[#5E665F] select-none font-medium">
            I confirm that all information provided is accurate.
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-[#E8E1D5] flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          disabled={isSubmitting}
          className="rounded-full border-[#E8E1D5] px-5 py-2 text-xs font-semibold text-[#183028] bg-white hover:bg-[#FAF8F4]"
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!isFormValid || isSubmitting}
          className="rounded-full bg-[#0F4D3F] px-6 py-2 text-xs font-semibold text-white hover:bg-[#0A352B] disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isSubmitting ? "Submitting..." : "Submit Organizer Request"}
        </Button>
      </div>
    </div>
  );
}