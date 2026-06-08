"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getEvents,
  deleteEvent,
  registerForEvent,
} from "@/lib/api";

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);

  async function handleDelete(
    eventId: number
  ) {
    const token =
      localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    await deleteEvent(
      token,
      eventId
    );

    setEvents(
      events.filter(
        (event) =>
          event.id !== eventId
      )
    );
  }

  async function handleRegister(
    eventId: number
  ) {
    const token =
      localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    const result =
      await registerForEvent(
        token,
        eventId
      );

    console.log(result);

    alert("Registered successfully!");
  }

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadEvents() {
      const data = await getEvents();
      setEvents(data);
    }

    loadEvents();
  }, [router]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Events</h1>

      <Link href="/create-event">
        Create New Event
      </Link>

      {events.map((event) => (
        <div
  key={event.id}
  className="border rounded-lg p-4 mt-4 shadow"
>
         <Link
  href={`/events/${event.id}`}
  className="text-xl font-bold text-blue-600 hover:underline"
>
  {event.title}
</Link>

          <p className="mt-2">
  {event.description}
</p>

         <p className="mt-2 text-gray-600">
  📍 {event.location}
</p>
<p className="mt-2">
  📅 Start:
  {" "}
  {new Date(
    event.start_date
  ).toLocaleString()}
</p>

<p>
  ⏰ End:
  {" "}
  {new Date(
    event.end_date
  ).toLocaleString()}
</p>


          <br />

          <Link
  href={`/edit-event/${event.id}`}
  className="mr-2 text-blue-600"
>
  Edit
</Link>

          {"  "}

          <button
  className="mr-2 border px-2 py-1 rounded"
  onClick={() =>
    handleDelete(event.id)
  }
>
  Delete
</button>

          {"  "}

          <button
  className="border px-2 py-1 rounded"
  onClick={() =>
    handleRegister(event.id)
  }
>
  Register
</button>
        </div>
      ))}
    </div>
  );
}