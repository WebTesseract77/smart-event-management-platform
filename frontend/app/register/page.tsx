"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { registerUser } from "@/lib/api";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Eye,
  EyeOff,
} from "lucide-react";

export default function RegisterPage() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

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

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      password !==
      confirmPassword
    ) {
      toast.error(
        "Passwords do not match"
      );
      return;
    }

    try {
      setLoading(true);

      await registerUser(
        name,
        email,
        password
      );

      toast.success(
        "Account created successfully. Check your email for verification OTP."
      );

      window.location.href =
  `/verify-email?email=${encodeURIComponent(email)}`;
    } catch (error) {
      console.error(error);

      toast.error(
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">

      <div className="w-full max-w-md rounded-2xl border bg-background shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>

        <p className="text-center text-muted-foreground mt-2 mb-8">
          Join Smart Event Management
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>
            <label className="block mb-2 text-sm font-medium">
              Full Name
            </label>
<p className="text-sm text-muted-foreground mt-1">
  Enter your full name as it should appear on event passes.
</p>
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Email
            </label>
<p className="text-sm text-muted-foreground mt-1">
  Use a valid email address for OTP verification.
</p>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Password
            </label>

            <div className="relative">

              <Input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
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
                placeholder="Confirm password"
                value={
                  confirmPassword
                }
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
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

            {confirmPassword &&
              password !==
                confirmPassword && (
                <p className="text-red-500 text-sm mt-2">
                  Passwords do not match
                </p>
              )}

            {confirmPassword &&
              password ===
                confirmPassword && (
                <p className="text-green-500 text-sm mt-2">
                  Passwords match
                </p>
              )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Register"}
          </Button>

        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">

          Already have an account?

          <Link
            href="/login"
            className="ml-1 font-medium text-primary hover:underline"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}