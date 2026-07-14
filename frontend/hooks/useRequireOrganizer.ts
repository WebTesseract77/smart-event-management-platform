"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "@/lib/api";

/** Returns true until the current session has been verified as an organizer. */
export function useRequireOrganizer(): boolean {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function verifyOrganizer() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const user = await getCurrentUser(token);

        if (user.role !== "organizer") {
          router.push("/events");
          return;
        }

        if (active) {
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.push("/login");
      }
    }

    verifyOrganizer();

    return () => {
      active = false;
    };
  }, [router]);

  return loading;
}
