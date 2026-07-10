"use client";

import {
  Suspense,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  ArrowLeft,
  Loader2,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;


function VerifyEmailContent() {
  const searchParams =
    useSearchParams();

  const email =
    searchParams.get("email") || "";

  const [otp, setOtp] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  function handleOtpChange(
    value: string,
    index: number
  ) {
    const arr =
      otp.split("");

    arr[index] =
      value.slice(-1);

    const newOtp =
      arr.join("");

    setOtp(newOtp);

    if (
      value &&
      index < 5
    ) {
      document
        .getElementById(
          `otp-${index + 1}`
        )
        ?.focus();
    }
  }


  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      document
        .getElementById(
          `otp-${index - 1}`
        )
        ?.focus();
    }
  }


  async function verifyEmail() {
    if (otp.length < 6) {
      toast.error(
        "Enter complete verification code."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/auth/verify-email?email=${email}&otp=${otp}`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();


      if (!response.ok) {
        toast.error(
          data.detail ||
          "Invalid verification code."
        );
        return;
      }


      toast.success(
        "Email verified successfully."
      );

      window.location.href =
        "/login";

    } catch (error) {

      console.error(error);

      toast.error(
        "Verification failed."
      );

    } finally {

      setLoading(false);

    }
  }


  async function resendOtp() {
    setLoading(true);

    try {

      const response =
        await fetch(
          `${API_URL}/auth/send-verification-otp?email=${email}`,
          {
            method: "POST",
          }
        );


      if (!response.ok) {
        toast.error(
          "Failed to resend OTP."
        );

        return;
      }


      toast.success(
        "Verification code sent again."
      );


    } catch (error) {

      console.error(error);

      toast.error(
        "Unable to send OTP."
      );

    } finally {

      setLoading(false);

    }
  }



  return (
  <div className="min-h-screen flex items-center justify-center px-4 py-6 bg-[#FAF8F4]">

    <div className="
      w-full
      max-w-5xl
      rounded-[2rem]
      md:rounded-[2.5rem]
      border border-[#E8E1D5]
      bg-white
      overflow-hidden
      shadow-sm
      grid
      md:grid-cols-2
      min-h-[560px]
    ">

      {/* LEFT DESKTOP ONLY */}
      <div className="
        hidden
        md:flex
        flex-col
        justify-between
        p-12
        bg-gradient-to-b
        from-[#FAF8F4]
        to-[#F5F2EA]
        border-r
        border-[#E8E1D5]
      ">

        <h1 className="font-serif font-bold text-xl text-[#183028]">
          EventSphere
        </h1>

        <div className="space-y-4">
          <h2 className="font-serif text-5xl leading-tight text-[#183028]">
            Verify your account
          </h2>

          <p className="text-sm text-[#5E665F] max-w-sm leading-relaxed">
            Confirm your email address to unlock your event workspace securely.
          </p>
        </div>

        <p className="text-[11px] uppercase tracking-[0.15em] text-[#5E665F]/60">
          Secure Email Verification
        </p>

      </div>


      {/* RIGHT */}
      <div className="
        flex
        flex-col
        justify-center
        bg-white
        px-6
        py-10
        sm:p-10
        md:p-16
      ">

        <div className="w-full max-w-md mx-auto">


          <header className="mb-8">

            <span className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.22em]
              text-[#0F4D3F]
            ">
              Email Verification
            </span>


            <h2 className="
              mt-3
              text-3xl
              sm:text-4xl
              font-semibold
              tracking-tight
              text-[#183028]
            ">
              Enter security code
            </h2>


            <p className="
              mt-4
              text-sm
              text-[#5E665F]
              leading-relaxed
              break-words
            ">
              Enter the 6-digit OTP sent to

              <br />

              <span className="font-medium text-[#183028] break-all">
                {email}
              </span>

            </p>

          </header>



          <div className="space-y-6">


            <div>

              <label className="
                block
                mb-3
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-[#183028]
              ">
                Verification Code
              </label>


              <div className="
                grid
                grid-cols-6
                gap-2
                sm:gap-3
              ">

                {Array.from({ length: 6 }).map(
                  (_, index) => (

                    <input
                      key={index}
                      id={`otp-${index}`}
                      maxLength={1}
                      value={otp[index] || ""}
                      disabled={loading}

                      onChange={(e) =>
                        handleOtpChange(
                          e.target.value,
                          index
                        )
                      }

                      onKeyDown={(e) =>
                        handleKeyDown(
                          e,
                          index
                        )
                      }

                      className="
                        w-full
                        aspect-square
                        max-h-14
                        text-center
                        text-lg
                        font-bold
                        rounded-xl
                        border
                        border-[#E8E1D5]
                        bg-[#FAF8F4]/50
                        text-[#183028]
                        focus:outline-none
                        focus:border-[#0F4D3F]
                      "
                    />

                  )
                )}

              </div>

            </div>



            <Button
              onClick={verifyEmail}
              disabled={loading}
              className="
                w-full
                h-12
                rounded-full
                bg-[#0F4D3F]
                hover:bg-[#0B3E33]
                text-white
              "
            >

              {loading && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}

              Verify Email

            </Button>


            <Button
              variant="outline"
              disabled={loading}
              onClick={resendOtp}
              className="
                w-full
                h-12
                rounded-full
                border-[#E8E1D5]
              "
            >
              Resend OTP
            </Button>


            <div className="
              pt-5
              border-t
              border-[#E8E1D5]/50
              text-center
            ">

              <button
                onClick={() =>
                  window.location.href = "/login"
                }

                className="
                  inline-flex
                  items-center
                  gap-2
                  text-xs
                  text-[#5E665F]
                  hover:text-[#0F4D3F]
                "
              >

                <ArrowLeft className="h-4 w-4" />

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




export default function VerifyEmailPage() {

  return (

    <Suspense>

      <VerifyEmailContent />

    </Suspense>

  );

}