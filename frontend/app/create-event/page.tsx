"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/lib/api";


export default function CreateEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  useEffect(() => {
  const token =
    localStorage.getItem("token");

  if (!token) {
    router.push("/login");
  }
}, [router]);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const token =
      localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      router.push("/login");
      return;
    }

    const result = await createEvent(
      token,
      {
        title,
        description,
        location,
        start_date:
          "2026-07-20T10:00:00",
        end_date:
          "2026-07-20T12:00:00",
      }
    );

    console.log(result);

    router.push("/events");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Create Event</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />
        </div>

        <br />

        <div>
          <input
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />
        </div>

        <br />

        <div>
          <input
            placeholder="Location"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
          />
        </div>

        <br />

        <button type="submit">
          Create Event
        </button>
      </form>
    </div>
  );
}