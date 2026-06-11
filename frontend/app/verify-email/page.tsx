"use client";

import {
  Suspense,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import { toast } from "sonner";

function VerifyEmailContent() {
  const searchParams =
    useSearchParams();

  const email =
    searchParams.get("email") ||
    "";

  const [otp, setOtp] =
    useState("");

  async function verifyEmail() {
    try {
      const response =
        await fetch(
          `http://127.0.0.1:8000/api/v1/auth/verify-email?email=${email}&otp=${otp}`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (response.ok) {
        toast.success(
          "Email verified successfully"
        );

        window.location.href =
          "/login";
      } else {
        toast.error(
          data.detail
        );
      }
    } catch {
      toast.error(
        "Verification failed"
      );
    }
  }

  async function resendOtp() {
    try {
      await fetch(
        `http://127.0.0.1:8000/api/v1/auth/send-verification-otp?email=${email}`,
        {
          method: "POST",
        }
      );

      toast.success(
        "OTP sent again"
      );
    } catch {
      toast.error(
        "Failed to send OTP"
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow">

        <h1 className="text-3xl font-bold text-center">
          Verify Email
        </h1>

        <p className="text-center text-muted-foreground mt-3 mb-6">
          Enter the OTP sent to
          <br />
          {email}
        </p>

        <input
          value={otp}
          onChange={(e) =>
            setOtp(
              e.target.value
            )
          }
          placeholder="Enter OTP"
          className="w-full border rounded-lg p-3"
        />

        <button
          onClick={verifyEmail}
          className="w-full mt-4 bg-primary text-primary-foreground rounded-lg p-3"
        >
          Verify Email
        </button>

        <button
          onClick={resendOtp}
          className="w-full mt-3 border rounded-lg p-3"
        >
          Resend OTP
        </button>

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}