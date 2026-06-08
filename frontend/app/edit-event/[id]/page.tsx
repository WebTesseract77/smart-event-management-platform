"use client";

import { use } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateEvent } from "@/lib/api";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const { id } = use(params);

  const [title, setTitle] = useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const token =
      localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

   const result = await updateEvent(
  token,
  Number(id),
  {
    title,
  }
);

await updateEvent(
  token,
  Number(id),
  {
    title,
  }
);

router.push("/events");

router.push("/events");

    router.push("/events");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Edit Event</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="New Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <br />
        <br />

        <button type="submit">
          Update Event
        </button>
      </form>
    </div>
  );
}