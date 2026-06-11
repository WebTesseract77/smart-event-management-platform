"use client";

import {
  use,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  getEvent,
  updateEvent,
} from "@/lib/api";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const { id } = use(params);

  const [loading, setLoading] =
    useState(true);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [location, setLocation] =
    useState("");
  const [imageUrl, setImageUrl] =
  useState("");
  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  useEffect(() => {
    async function loadEvent() {
      try {
        const event =
          await getEvent(
            Number(id)
          );

        setTitle(
          event.title || ""
        );

        setDescription(
          event.description || ""
        );

        setLocation(
          event.location || ""
        );
        setImageUrl(
           event.image_url || ""
        );

        setStartDate(
          event.start_date
            ?.slice(0, 16) || ""
        );

        setEndDate(
          event.end_date
            ?.slice(0, 16) || ""
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await updateEvent(
  token,
  Number(id),
  {
    title,
    description,
    location,
    image_url: imageUrl
      .replace("Image URL:", "")
      .trim(),
    start_date: startDate,
    end_date: endDate,
  }
);

      router.push("/events");
    } catch (error) {
      console.error(error);

      alert(
        "Failed to update event"
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-background border rounded-xl shadow p-8">

        <h1 className="text-3xl font-bold mb-6">
          Edit Event
        </h1>
<p className="text-sm text-muted-foreground mt-1">
  Enter a short and descriptive event title.
</p>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Event Title"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />
<p className="text-sm text-muted-foreground mt-1">
  Describe the event, schedule and purpose.
</p>
          <textarea
            className="w-full border rounded-lg p-3"
            rows={4}
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />
<p className="text-sm text-muted-foreground mt-1">
  Enter venue name, hall, building or room number.
</p>
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Location"
            value={location}
            onChange={(e) =>
              setLocation(
                e.target.value
              )
            }
          />
<p className="text-sm text-muted-foreground mt-1">
  Optional banner image for your event.
</p>

<input
  className="w-full border rounded-lg p-3"
  placeholder="Image URL"
  value={imageUrl}
  onChange={(e) =>
    setImageUrl(e.target.value)
  }
/>
          <div>
            <label className="block mb-2 font-medium">
              Start Date & Time (IST)
            </label>

            <input
              type="datetime-local"
              className="w-full border rounded-lg p-3"
              value={startDate}
              onChange={(e) =>
                setStartDate(
                  e.target.value
                )
              }
            />
          </div>
<p className="text-sm text-muted-foreground mt-1">
  *Select event start date and time (IST).
</p>
          <div>
            <label className="block mb-2 font-medium">
              End Date & Time (IST)
            </label>

            <input
              type="datetime-local"
              className="w-full border rounded-lg p-3"
              value={endDate}
              onChange={(e) =>
                setEndDate(
                  e.target.value
                )
              }
            />
          </div>
<p className="text-sm text-muted-foreground mt-1">
  *Must be later than the start date.
</p>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-lg p-3"
          >
            Update Event
          </button>
        </form>

      </div>
    </div>
  );
}