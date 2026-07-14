"use client";

import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepTwoProps {
  formData: { event_categories: string[]; events_per_year: string };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORIES = [
  { id: "Hackathons", display: "💻 Hackathons" },
  { id: "College Events", display: "🎓 College Events" },
  { id: "Tech Talks", display: "🎤 Tech Talks" },
  { id: "Sports", display: "🏀 Sports" },
  { id: "Gaming", display: "🎮 Gaming" },
  { id: "Music", display: "🎵 Music" },
  { id: "Startup", display: "🚀 Startup" },
  { id: "Community", display: "🤝 Community" },
  { id: "Cultural", display: "🎨 Cultural" },
  { id: "Workshops", display: "🧪 Workshops" },
];

const VOLUMES = ["1–5", "5–10", "10–20", "20+"];

export default function WizardStepTwo({ formData, setFormData, onNext, onBack }: StepTwoProps) {
  const isStepValid = formData.event_categories.length > 0 && formData.events_per_year !== "";

  const toggleCategory = (catId: string) => {
    setFormData((prev: any) => {
      const active = prev.event_categories.includes(catId);
      return {
        ...prev,
        event_categories: active
          ? prev.event_categories.filter((id: string) => id !== catId)
          : [...prev.event_categories, catId],
      };
    });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="font-serif text-xl font-semibold tracking-tight text-[#183028]">
          Event Details
        </h3>
        <p className="text-xs text-[#5E665F]">
          Select categories and project your expected operational volumes below.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#7C8B83]">
            Event Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = formData.event_categories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "border-[#0F4D3F] bg-[#ECF7EE] text-[#0F4D3F]"
                      : "border-[#E8E1D5] bg-[#FAF8F4] text-[#5E665F] hover:border-[#7C8B83]"
                  }`}
                >
                  {cat.display}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#7C8B83]">
            Events Per Year
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {VOLUMES.map((vol) => {
              const active = formData.events_per_year === vol;
              return (
                <button
                  key={vol}
                  type="button"
                  onClick={() => setFormData((prev: any) => ({ ...prev, events_per_year: vol }))}
                  className={`flex items-center justify-start p-3.5 rounded-xl border text-xs font-bold transition-all ${
                    active
                      ? "border-[#0F4D3F] bg-[#ECF7EE] text-[#0F4D3F]"
                      : "border-[#E8E1D5] bg-[#FAF8F4] text-[#183028] hover:border-[#7C8B83]"
                  }`}
                >
                  <div className={`h-3.5 w-3.5 rounded-full border mr-2 flex items-center justify-center ${active ? "border-[#0F4D3F]" : "border-[#7C8B83]"}`}>
                    {active && <div className="h-1.5 w-1.5 rounded-full bg-[#0F4D3F]" />}
                  </div>
                  {vol}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#E8E1D5] flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="rounded-full border-[#E8E1D5] px-5 py-2 text-xs font-semibold text-[#183028] bg-white hover:bg-[#FAF8F4]"
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back
        </Button>
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