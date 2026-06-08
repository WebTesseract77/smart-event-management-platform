"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getEvent } from "@/lib/api";

export default function EventDetailsPage() {
  const params = useParams();

  const [event, setEvent] =
    useState<any>(null);

  useEffect(() => {
    async function loadEvent() {
      const data = await getEvent(
        Number(params.id)
      );

      setEvent(data);
    }

    loadEvent();
  }, [params]);

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
  <div style={{ padding: 20 }}>
    <h1>{event.title}</h1>

    <p>{event.description}</p>

    <p>
      📍 {event.location}
    </p>

    <p>
      📅 Start:{" "}
      {new Date(
        event.start_date
      ).toLocaleString()}
    </p>

    <p>
      ⏰ End:{" "}
      {new Date(
        event.end_date
      ).toLocaleString()}
    </p>

    <br />

    <Link
      href={`/events/${event.id}/participants`}
    >
      View Participants
    </Link>
  </div>
);
}