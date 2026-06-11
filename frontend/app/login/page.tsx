"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { loginUser } from "@/lib/api";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      const data =
        await loginUser(
          email,
          password
        );

      if (data.access_token) {
        localStorage.setItem(
          "token",
          data.access_token
        );

        toast.success(
          "Login successful"
        );

        window.location.href =
          "/events";
      } else {
        toast.error(
          "Login failed"
        );
      }
    } catch (error: any) {
      console.error(error);

      toast.error(
        "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">

      <div className="w-full max-w-md rounded-2xl border bg-background shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center">
          Welcome Back
        </h1>

        <p className="text-center text-muted-foreground mt-2 mb-8">
          Login to your account
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>
            <label className="block mb-2 text-sm font-medium">
              Email
            </label>
<p className="text-sm text-muted-foreground mt-1">
  Enter your registered email address.
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
<p className="text-sm text-muted-foreground mt-1">
  Enter the password associated with your account.
</p>
            <div className="relative">

              <Input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
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

            <div className="flex justify-end mt-2">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </Button>

        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">

          Don't have an account?

          <Link
            href="/register"
            className="ml-1 font-medium text-primary hover:underline"
          >
            Register
          </Link>

        </p>

      </div>

    </div>
  );
}