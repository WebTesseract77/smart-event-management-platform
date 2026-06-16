"use client";
import { useState } from "react";
import { createEvent } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateEventPage() { 
  const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [location, setLocation] = useState("");
const [imageUrl, setImageUrl] = useState("");
const [capacity, setCapacity] = useState(100);

const [isTeamEvent, setIsTeamEvent] =
  useState(false);

const [minTeamSize, setMinTeamSize] =
  useState(2);

const [maxTeamSize, setMaxTeamSize] =
  useState(6);

const [startDate, setStartDate] =
  useState("");

const [endDate, setEndDate] =
  useState("");
const handleSubmit = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  try {
    const token =
      localStorage.getItem("token");

    if (!token) {
      alert("Please login");
      return;
    }
if (new Date(endDate) <= new Date(startDate)) {
  alert(
    "End date must be after start date"
  );
  return;
}
    await createEvent(token, {
      title,
      description,
      location,
      image_url:
  imageUrl.trim() || undefined,
      capacity,
      start_date: startDate,
      end_date: endDate,
      is_team_event: isTeamEvent,
      min_team_size: minTeamSize,
      max_team_size: maxTeamSize,
    });

    alert("Event created!");
  } catch (error) {
    console.error(error);
    alert("Failed to create event");
  }
};
  return (
    <main className="min-h-screen bg-muted/30 py-10 px-4">
     <div
  style={{
    maxWidth: "820px",
    margin: "0 auto",
    background: "white",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  }}
>
        {/* Header */}

        <div className="mb-10">
  <h1
  style={{
    fontSize: "38px",
    fontWeight: "800",
    lineHeight: "1",
  }}
>
  Create Event
</h1>

  <p
    style={{
      marginTop: "16px",
      fontSize: "18px",
      color: "#6b7280",
    }}
  >
    Fill in the details below to create and
    schedule a new event.
  </p>
</div>
        {/* Form */}

        <form
  onSubmit={handleSubmit}
  className="space-y-8"
>

          {/* Event Title */}

          <div>
            <label className="block mb-3 font-semibold">
              Event Title
            </label>

            <Input
  required  value={title}
  onChange={(e) =>
    setTitle(e.target.value)
  }
              

  placeholder="Enter a short and descriptive event title"
  className="h-12"
/>
          </div>

          {/* Description */}

          <div>
            <label className="block mb-3 font-semibold">
              Description
            </label>

            <textarea
  required
  rows={5}
  value={description}
  onChange={(e) =>
    setDescription(e.target.value)
  }
  placeholder="Describe the event, schedule and purpose"
              className="
                w-full
                rounded-xl
                border
                p-4
                outline-none
                focus:ring-2
                focus:ring-violet-500
              "
            />
          </div>

          {/* Location */}

          <div>
            <label className="block mb-3 font-semibold">
              Location
            </label>

            <input
  required
  type="text"
  value={location}
  onChange={(e) =>
    setLocation(e.target.value)
  }
              placeholder="Enter venue name, hall, building or room number"
              className="
                w-full
                h-14
                rounded-xl
                border
                px-4
                outline-none
                focus:ring-2
                focus:ring-violet-500
              "
            />
          </div>

          {/* Image URL */}

          <div>
            <label className="block mb-3 font-semibold">
              Image URL
              <span className="ml-2 text-sm text-muted-foreground">
                (Optional)
              </span>
            </label>

            <input
  type="text"
  value={imageUrl}
  onChange={(e) =>
    setImageUrl(e.target.value)
  }
              placeholder="Paste banner image URL"
              className="
                w-full
                h-14
                rounded-xl
                border
                px-4
                outline-none
                focus:ring-2
                focus:ring-violet-500
              "
            />
          </div>

          {/* Capacity */}

          <div>
            <label className="block mb-3 font-semibold">
              Capacity
            </label>

           <input
  type="number"
  value={capacity}
  onChange={(e) =>
    setCapacity(Number(e.target.value))
  }
              className="
                w-full
                h-14
                rounded-xl
                border
                px-4
                outline-none
                focus:ring-2
                focus:ring-violet-500
              "
            />
          </div>

          {/* Team Event */}

          <div
  style={{
    background: "#f5f3ff",
    border: "1px solid #ddd6fe",
    borderRadius: "16px",
    padding: "24px",
  }}
>
            <div className="flex gap-4">
              <input
  type="checkbox"
  checked={isTeamEvent}
  onChange={(e) =>
    setIsTeamEvent(e.target.checked)
  }
/>

              <div>
                <h3 className="font-semibold text-lg">
                  Team Event
                </h3>

                <p className="text-muted-foreground mt-1">
                  Enable team registration for
                  hackathons, coding contests and
                  competitions.
                </p>
              </div>
            </div>

            {isTeamEvent && (
  <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block mb-2 font-medium">
                  Minimum Team Size
                </label>

                <input
                
                  type="number"
                  value={minTeamSize}
onChange={(e) =>
  setMinTeamSize(Number(e.target.value))
}
                  className="
                    w-full
                    h-14
                    rounded-xl
                    border
                    px-4
                  "
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Maximum Team Size
                </label>

                <input
               
                  type="number"
                  value={maxTeamSize}
onChange={(e) =>
  setMaxTeamSize(Number(e.target.value))
}
                  className="
                    w-full
                    h-14
                    rounded-xl
                    border
                    px-4
                  "
                />
              </div>
             </div>
            
)}
</div>
          {/* Start Date */}

          <div>
            <label className="block mb-3 font-semibold">
              Start Date & Time
            </label>

            <input
  required
  type="datetime-local"
  value={startDate}
  onChange={(e) =>
    setStartDate(e.target.value)
  }
              className="
                w-full
                h-14
                rounded-xl
                border
                px-4
              "
            />
          </div>

          {/* End Date */}

          <div>
            <label className="block mb-3 font-semibold">
              End Date & Time
            </label>

<input
  required  type="datetime-local"
  value={endDate}
  onChange={(e) =>
    setEndDate(e.target.value)
  }
              className="
                w-full
                h-14
                rounded-xl
                border
                px-4
              "
            />
          </div>

          {/* Submit */}

          <Button
  type="submit"
  className="w-full h-12"
>
  Create Event
</Button>
        </form>
      </div>
    </main>
  );
}