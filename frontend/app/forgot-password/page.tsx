"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";


const API_URL =
  process.env.NEXT_PUBLIC_API_URL;


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Segmented OTP inputs logic handler for 6 digits box representation
  const handleOtpChange = (value: string, index: number) => {
    const otpArray = otp.split("");
    otpArray[index] = value.slice(-1);
    const newOtp = otpArray.join("");
    setOtp(newOtp);

    // Auto-focus next element
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  async function sendOtp() {
    if (!email) {
      toast.error("Enter your registered email address.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/auth/forgot-password?email=${email}`,
        { method: "POST" }
      );
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.detail || "Verification request failed.");
        return;
      }

      setOtpSent(true);
      toast.success("Verification security code sent to your email.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to transmit verification code.");
    } finally {
      setIsLoading(false);
    }
  }

  async function resetPassword() {
    if (otp.length < 6 || !newPassword || !confirmPassword) {
      toast.error("Please fill in all layout blocks securely.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/auth/reset-password?email=${email}&otp=${otp}&new_password=${newPassword}`,
        { method: "POST" }
      );
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.detail || "Authentication token matching expired.");
        return;
      }

      toast.success("Password changed successfully.");
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      toast.error("Password reset workflow failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
   <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:p-8 bg-[#FAF8F4] selection:bg-[#0F4D3F]/10">

<div className="
  w-full 
  max-w-5xl 
  rounded-[1.5rem] 
  sm:rounded-[2.5rem]
  border 
  border-[#E8E1D5] 
  bg-white 
  overflow-hidden 
  shadow-[0_8px_30px_rgb(24,48,40,0.02)]
  grid 
  md:grid-cols-2
">
        
        {/* Left Pane */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-b from-[#FAF8F4] to-[#F5F2EA] border-r border-[#E8E1D5]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-xl text-[#183028] tracking-tight">EventSphere</span>
          </div>
          
          <div className="my-auto space-y-4">
           
            <p className="text-sm text-[#5E665F] max-w-sm leading-relaxed font-normal">
              Recover your account securely and continue managing your events.
            </p>
          </div>
          
          <div className="text-[11px] uppercase tracking-[0.15em] text-[#5E665F]/60 font-medium">
            Secured Workspace Entry
          </div>
        </div>

        {/* Right Pane */}
        <div className="
 flex 
 flex-col 
 justify-center 
 px-5 
 py-8
 sm:p-12 
 md:p-16 
 bg-white
">
          <div className="w-full max-w-md mx-auto">
            
            <header className="mb-8">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0F4D3F] block mb-2">
                Password Recovery
              </span>
              <h2 className="
 text-2xl
 sm:text-3xl
 font-semibold 
 tracking-tight 
 text-[#183028] 
 mb-2
">
                {otpSent ? "Verify code" : "Reset your password"}
              </h2>
              <p className="text-sm text-[#5E665F] leading-relaxed">
                {otpSent 
                  ? "Enter the 6-digit confirmation key provided to update configuration values." 
                  : "Enter your registered email and we'll send a reset link."}
              </p>
            </header>

            <div className="space-y-5">
              <div>
                <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-[#183028]">
                  Email Address
                </label>
                <Input
                  type="email"
                  disabled={otpSent || isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-full border-[#E8E1D5] px-4 focus-visible:ring-1 focus-visible:ring-[#0F4D3F] focus-visible:border-[#0F4D3F] text-sm text-[#183028] bg-transparent transition-all"
                />
              </div>

              {!otpSent ? (
                <Button
                  className="w-full h-11 rounded-full bg-[#0F4D3F] hover:bg-[#0B3E33] text-white font-medium text-sm tracking-wide transition-all duration-200 shadow-sm mt-2 flex items-center justify-center gap-2"
                  onClick={sendOtp}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? "Processing..." : "Continue"}
                </Button>
              ) : (
                <>
                  <div>
                    <label className="block mb-3 text-xs font-semibold uppercase tracking-wider text-[#183028]">
                      Enter verification code
                    </label>
                    <div className="
 flex 
 items-center 
 justify-center 
 gap-2 
 sm:gap-3
 w-full
 my-2
">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <input
                          key={index}
                          id={`otp-input-${index}`}
                          type="text"
                          maxLength={1}
                          disabled={isLoading}
                          value={otp[index] || ""}
                          onChange={(e) => handleOtpChange(e.target.value, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="
 w-10
 h-12
 sm:w-11
 sm:h-12
 text-center
 font-serif
 text-lg
 sm:text-xl
 font-bold
 text-[#183028]
 border
 border-[#E8E1D5]
 rounded-xl
 bg-[#FAF8F4]/40
 focus:outline-none
 focus:border-[#0F4D3F]
 focus:ring-1
 focus:ring-[#0F4D3F]
 transition-all
 disabled:opacity-50
"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-[#183028]">
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          disabled={isLoading}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-11 rounded-full border-[#E8E1D5] pl-4 pr-12 focus-visible:ring-1 focus-visible:ring-[#0F4D3F] text-sm text-[#183028]"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-4 top-3.5 text-[#5E665F]/70 hover:text-[#183028] transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-[#183028]">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          disabled={isLoading}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-11 rounded-full border-[#E8E1D5] pl-4 pr-12 focus-visible:ring-1 focus-visible:ring-[#0F4D3F] text-sm text-[#183028]"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-4 top-3.5 text-[#5E665F]/70 hover:text-[#183028] transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full h-11 rounded-full bg-[#0F4D3F] hover:bg-[#0B3E33] text-white font-medium text-sm tracking-wide transition-all duration-200 shadow-sm mt-3 flex items-center justify-center gap-2"
                    onClick={resetPassword}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLoading ? "Updating Credentials..." : "Reset Password"}
                  </Button>
                </>
              )}

              <div className="text-center pt-4 border-t border-[#E8E1D5]/40 mt-4">
                <button
                  type="button"
                  onClick={() => (window.location.href = "/login")}
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#5E665F] hover:text-[#0F4D3F] transition-all group"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transform group-hover:-translate-x-0.5 transition-transform" /> 
                  Back to Sign In
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}