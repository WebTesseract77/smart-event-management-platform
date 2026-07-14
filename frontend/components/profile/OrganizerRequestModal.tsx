"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, AlertCircle } from "lucide-react";
import { createOrganizerRequest, OrganizerRequestResponse } from "@/lib/api";
import WizardStepOne from "./WizardStepOne";
import WizardStepTwo from "./WizardStepTwo";
import WizardStepThree from "./WizardStepThree";
import RequestSuccessDialog from "./RequestSuccessDialog";

interface OrganizerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  existingRequest: OrganizerRequestResponse | null;
  onSuccess: () => void;
  // Passing user profile directly to stay clean and flat without hooks/context folders
  userProfile?: {
    emailVerified: boolean;
    isProfileComplete: boolean;
  };
}

export default function OrganizerRequestModal({
  isOpen,
  onClose,
  token,
  existingRequest,
  onSuccess,
  userProfile = { emailVerified: true, isProfileComplete: true },
}: OrganizerRequestModalProps) {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    organization: "",
    portfolio_url: "",
    experience: "",
    event_categories: [] as string[],
    events_per_year: "",
    reason: "",
  });
  
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic status evaluation to prevent incorrect 100% indicator before user inputs text
  const getProgressPercent = () => {
    if (step === 1) return 33;
    if (step === 2) return 66;
    if (step === 3) {
      return formData.reason.length >= 100 && agreed ? 100 : 85;
    }
    return 0;
  };

  // Keyboard navigation accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      modalRef.current?.focus();
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setShowSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const payload = {
  organization: formData.organization.trim(),
  portfolio_url:
    formData.portfolio_url.trim() !== ""
      ? formData.portfolio_url.trim()
      : undefined,
  experience: formData.experience.trim(),
  event_categories: formData.event_categories,
  events_per_year: formData.events_per_year,
  reason: formData.reason.trim(),
};

    try {
      await createOrganizerRequest(token, payload);
      setShowSuccess(true);
    } catch (err: any) {
      // Integrated fallback directly using a clean localized window or toast format
      alert(err.message || "Failed to submit organizer request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    onSuccess();
    onClose();
  };

  const isEligible = userProfile.emailVerified && userProfile.isProfileComplete;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Dimmed backdrop background */}
      <div className="absolute inset-0 bg-[#183028]/40 backdrop-blur-sm" onClick={onClose} />

      {/* Main Premium Card Surface Container */}
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-[32px] border border-[#E8E1D5] bg-[#FAF8F4] shadow-[0_24px_60px_rgba(24,48,40,0.12)] outline-none flex flex-col lg:flex-row text-[#183028]"
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#E8E1D5] bg-white text-[#5E665F] transition-colors hover:bg-[#E8E1D5] hover:text-[#183028]"
        >
          <X className="h-4 w-4" />
        </button>

        {showSuccess ? (
          <RequestSuccessDialog onDone={handleDone} />
        ) : (
          <>
            {/* Form Steps Flow Section */}
            <div className="flex-1 p-6 sm:p-8 lg:p-10 bg-white border-b lg:border-b-0 lg:border-r border-[#E8E1D5]">
              
              {/* Premium Animated Progress Indicator */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#7C8B83]">
                  <span>Step {step} of 3</span>
                  <span className="text-[#0F4D3F]">{getProgressPercent()}% Complete</span>
                </div>
                <div className="relative h-1.5 w-full rounded-full bg-[#FAF8F4] border border-[#E8E1D5]/50 overflow-hidden">
                  <motion.div 
                    className="absolute bottom-0 left-0 top-0 bg-[#0F4D3F] rounded-full"
                    initial={{ width: "33.3%" }}
                    animate={{ width: `${getProgressPercent()}%` }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  />
                </div>
              </div>

              {/* Steps Routing Interface */}
              <div className="min-h-[380px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1"
                  >
                    {step === 1 && (
                      <WizardStepOne 
                        formData={formData} 
                        setFormData={setFormData} 
                        onNext={handleNext} 
                      />
                    )}
                    {step === 2 && (
                      <WizardStepTwo 
                        formData={formData} 
                        setFormData={setFormData} 
                        onNext={handleNext} 
                        onBack={handleBack} 
                      />
                    )}
                    {step === 3 && (
                      <WizardStepThree 
                        formData={formData} 
                        setFormData={setFormData} 
                        agreed={agreed}
                        setAgreed={setAgreed}
                        isSubmitting={isSubmitting}
                        onSubmit={handleSubmit} 
                        onBack={handleBack} 
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Inlined Dynamic Eligibility/Requirements Sidebar Panel */}
            <div className="w-full lg:w-[320px] bg-[#FAF8F4] p-6 sm:p-8 flex flex-col justify-between rounded-b-[32px] lg:rounded-b-0 lg:rounded-r-[32px]">
              <div className="space-y-5">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#0F4D3F]">
                  Eligibility
                </h4>
                <ul className="space-y-3.5 text-xs sm:text-sm font-medium text-[#183028]" role="list">
                  <li className="flex items-start gap-2.5">
                    {userProfile.emailVerified ? (
                      <span className="text-[#0F4D3F] font-bold">✓</span>
                    ) : (
                      <AlertCircle className="h-4 w-4 text-[#B42318] mt-0.5" />
                    )}
                    <div>
                      <span className={userProfile.emailVerified ? "" : "text-[#B42318] font-semibold"}>
                        Verified Email
                      </span>
                      {!userProfile.emailVerified && (
                        <p className="text-[10px] text-[#B42318] mt-0.5 font-medium">Please verify via account settings.</p>
                      )}
                    </div>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className={userProfile.isProfileComplete ? "text-[#0F4D3F] font-bold" : "text-[#7C8B83]"}>
                      {userProfile.isProfileComplete ? "✓" : "○"}
                    </span>
                    <span>Profile Complete</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className={isEligible ? "text-[#0F4D3F] font-bold" : "text-[#7C8B83]"}>
                      {isEligible ? "✓" : "○"}
                    </span>
                    <span>Eligible to Apply</span>
                  </li>
                </ul>

                <div className="pt-4 border-t border-[#E8E1D5] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#7C8B83]">Review Type</span>
                    <span className="font-bold text-[#0F4D3F]">Manual Review</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-[#E8E1D5] pt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF6E7] text-[#A9771E]">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C8B83]">
                    Average review time
                  </p>
                  <p className="text-xs font-semibold text-[#183028]">
                    1–3 Business Days
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}