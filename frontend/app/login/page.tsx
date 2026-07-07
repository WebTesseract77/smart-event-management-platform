"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { loginUser, getCurrentUser } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await loginUser(email, password);
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        const user = await getCurrentUser(data.access_token);
        localStorage.setItem("role", user.role);
        toast.success("Login successful");
        window.location.href = "/events";
      } else {
        toast.error("Login failed");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2.5rem] border border-[#E8E1D5] bg-white shadow-sm lg:grid-cols-[0.95fr_1.05fr]">
          
          {/* Left Pane - Now clean and centered */}
          <div className="relative flex flex-col justify-center bg-[linear-gradient(to_bottom,#FAF8F4,#F5F2EA)] p-8 sm:p-10 lg:p-12">
            <div className="space-y-3">
              <h1 className="font-serif text-[3.5rem] leading-[0.92] tracking-[-0.05em] text-[#183028]">
                       Welcome Back
             </h1>
              <p className="max-w-md text-base leading-7 text-[#5E665F]">
                Sign in to continue managing your events, registrations, and team activity.
              </p>
            </div>
          </div>

          {/* Right Pane - Login Form */}
          <div className="flex items-center justify-center bg-white p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8 space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0F4D3F]">Sign in</p>
                <h2 className="text-3xl font-semibold tracking-tight text-[#183028]">Access your account</h2>
                <p className="text-sm leading-6 text-[#5E665F]">
                  Enter your details to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#183028]">Email</label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-full border-[#E8E1D5] bg-white px-4 text-[#183028] placeholder:text-[#5E665F] focus:border-[#0F4D3F] focus:ring-[#0F4D3F]/20"
                  />
                  <p className="text-sm text-[#5E665F]">Enter your registered email address.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#183028]">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 rounded-full border-[#E8E1D5] bg-white px-4 pr-12 text-[#183028] placeholder:text-[#5E665F] focus:border-[#0F4D3F] focus:ring-[#0F4D3F]/20"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E665F]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-sm text-[#5E665F]">Enter the password associated with your account.</p>
                </div>

                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm font-medium text-[#0F4D3F] hover:underline">
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full rounded-full bg-[#0F4D3F] text-white shadow-sm transition-all duration-300 hover:bg-[#0B3E33]"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-[#5E665F]">
                Don&apos;t have an account?
                <Link href="/register" className="ml-1 font-semibold text-[#0F4D3F] hover:underline">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}