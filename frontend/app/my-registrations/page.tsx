"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  getMyRegistrations,
  unregisterFromEvent,
} from "@/lib/api";

export default function MyRegistrationsPage() {
  const router = useRouter();

  const [registrations, setRegistrations] =
    useState<any[]>([]);

  async function handleUnregister(
    eventId: number
  ) {
    const token =
      localStorage.getItem("token");

    if (!token) return;

    await unregisterFromEvent(
      token,
      eventId
    );

    setRegistrations(
      registrations.filter(
        (registration) =>
          registration.event_id !== eventId
      )
    );
  }

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }
async function loadData() {
  if (!token) return;

  const data =
    await getMyRegistrations(token);

  setRegistrations(data);
}

    loadData();
  }, [router]);

  return (
    <div style={{ padding: 20 }}>
      <h1>My Registrations</h1>

      {registrations.length === 0 ? (
        <p>No registrations found.</p>
      ) : (
        registrations.map((registration) => (
          <div
            key={registration.id}
            style={{
              border: "1px solid #ccc",
              padding: 15,
              marginTop: 10,
            }}
          >
            <h3>
              Registration #{registration.id}
            </h3>

            <h3>
              {registration.event?.title ??
                `Event ${registration.event_id}`}
            </h3>

            <p>
              📍 {registration.event?.location}
            </p>

            <p>
              Registered On:{" "}
              {new Date(
                registration.registered_at
              ).toLocaleString()}
            </p>

            <br />

            <button
              className="border px-2 py-1 rounded"
              onClick={() =>
                handleUnregister(
                  registration.event_id
                )
              }
            >
              Unregister
            </button>

            {" "}

            <Link
              href={`/pass/${registration.id}`}
              className="border px-2 py-1 rounded ml-2"
            >
              View Pass
            </Link>
          </div>
        ))
      )}
    </div>
  );
}