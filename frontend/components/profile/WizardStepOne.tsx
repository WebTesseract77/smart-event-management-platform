"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StepOneProps {
  formData: { organization: string; portfolio_url: string; experience: string };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
}

const EXPERIENCE_OPTIONS = [
  { key: "beginner", label: "Beginner", desc: "Hosted 0–2 events" },
  { key: "intermediate", label: "Intermediate", desc: "Hosted 3–10 events" },
  { key: "experienced", label: "Experienced", desc: "Hosted 10+ events" },
];

export default function WizardStepOne({ formData, setFormData, onNext }: StepOneProps) {
  const isStepValid = formData.organization.trim() !== "" && formData.experience !== "";

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1 rounded-full border border-[#E8E1D5] bg-[#F5F2EA] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0F4D3F]">
          Organizer Program
        </div>
        <h3 id="wizard-title" className="font-serif text-2xl font-semibold tracking-tight text-[#183028]">
          Become an Organizer
        </h3>
        <p className="text-xs text-[#5E665F] leading-relaxed">
          Host hackathons, workshops, cultural events, gaming tournaments, community meetups and more. Every application is manually reviewed.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#7C8B83]">
            Organization
          </label>
          <Input
            value={formData.organization}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, organization: e.target.value }))}
            placeholder="Your organization name"
            className="rounded-xl border-[#E8E1D5] bg-[#FAF8F4] focus-visible:ring-[#0F4D3F]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#7C8B83]">
            Portfolio / Website / GitHub / LinkedIn (optional)
          </label>
          <Input
            type="url"
            value={formData.portfolio_url}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, portfolio_url: e.target.value }))}
            placeholder="https://yourportfolio.com"
            className="rounded-xl border-[#E8E1D5] bg-[#FAF8F4] focus-visible:ring-[#0F4D3F]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#7C8B83]">
            Experience Level
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            {EXPERIENCE_OPTIONS.map((opt) => {
              const active = formData.experience === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setFormData((prev: any) => ({ ...prev, experience: opt.key }))}
                  className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                    active
                      ? "border-[#0F4D3F] bg-[#ECF7EE] text-[#0F4D3F]"
                      : "border-[#E8E1D5] bg-[#FAF8F4] text-[#183028] hover:border-[#7C8B83]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ${active ? "border-[#0F4D3F]" : "border-[#7C8B83]"}`}>
                      {active && <div className="h-1.5 w-1.5 rounded-full bg-[#0F4D3F]" />}
                    </div>
                    <span className="text-xs font-bold tracking-tight">{opt.label}</span>
                  </div>
                  <span className="mt-1.5 text-[11px] opacity-80 pl-5">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#E8E1D5] flex justify-end">
        <Button
          onClick={onNext}
          disabled={!isStepValid}
          className="rounded-full bg-[#0F4D3F] px-6 py-2 text-xs font-semibold text-white hover:bg-[#0A352B]"
        >
          Continue <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}