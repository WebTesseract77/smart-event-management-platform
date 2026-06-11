"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Eye,
  EyeOff,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [otpSent, setOtpSent] =
    useState(false);

  async function sendOtp() {
    try {
      const response =
        await fetch(
          `http://127.0.0.1:8000/api/v1/auth/forgot-password?email=${email}`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        toast.error(
          data.detail
        );
        return;
      }

      setOtpSent(true);

      toast.success(
        "OTP sent to your email"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to send OTP"
      );
    }
  }

  async function resetPassword() {
    if (
      newPassword !==
      confirmPassword
    ) {
      toast.error(
        "Passwords do not match"
      );
      return;
    }

    try {
      const response =
        await fetch(
          `http://127.0.0.1:8000/api/v1/auth/reset-password?email=${email}&otp=${otp}&new_password=${newPassword}`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        toast.error(
          data.detail
        );
        return;
      }

      toast.success(
        "Password changed successfully"
      );

      window.location.href =
        "/login";
    } catch (error) {
      console.error(error);

      toast.error(
        "Password reset failed"
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">

      <div className="w-full max-w-md rounded-2xl border bg-background p-8 shadow-lg">

        <h1 className="text-3xl font-bold text-center">
          Forgot Password
        </h1>

        <p className="text-center text-muted-foreground mt-2 mb-8">
          Reset your account password
        </p>

        <div className="space-y-5">

          <div>
            <label className="block mb-2 text-sm font-medium">
              Email
            </label>
<p className="text-sm text-muted-foreground mt-1">
  Enter the email address linked to your account.
</p>
            <Input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Enter your email"
            />
          </div>

          {!otpSent ? (
            <Button
              className="w-full"
              onClick={sendOtp}
            >
              Send OTP
            </Button>
          ) : (
            <>
              <div>
                <label className="block mb-2 text-sm font-medium">
                  OTP
                </label>

                <Input
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                    )
                  }
                  placeholder="Enter OTP"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  New Password
                </label>

                <div className="relative">

                  <Input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      newPassword
                    }
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="absolute right-3 top-2"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Confirm Password
                </label>

                <div className="relative">

                  <Input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmPassword
                    }
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                  />
<p className="text-sm text-muted-foreground mt-1">
  *Minimum 8 characters recommended.
</p>
                  <button
                    type="button"
                    className="absolute right-3 top-2"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>
              </div>

              <Button
                className="w-full"
                onClick={
                  resetPassword
                }
              >
                Reset Password
              </Button>
            </>
          )}

        </div>

      </div>

    </div>
  );
}