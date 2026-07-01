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
import dayjs, { Dayjs } from "dayjs";

import { ThemeProvider, createTheme } from "@mui/material/styles";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const { id } = use(params);

  const [loading, setLoading] =
    useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [location, setLocation] =
    useState("");
  const [imageUrl, setImageUrl] =
  useState("");
  const [startDate, setStartDate] =
  useState<Dayjs | null>(null);

const [endDate, setEndDate] =
  useState<Dayjs | null>(null);

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
  dayjs(event.start_date)
);

setEndDate(
  dayjs(event.end_date)
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

    if (submitting) {
      return;
    }

    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setSubmitting(true);
      if (
  startDate &&
  endDate &&
  endDate.isBefore(startDate)
) {
  alert(
    "End date must be after start date"
  );
  return;
}
if (
  startDate &&
  startDate.isBefore(dayjs())
) {
  alert(
    "Event cannot start in the past"
  );
  return;
}
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
    start_date:
  startDate?.format(
    "YYYY-MM-DDTHH:mm:ss"
  ) ?? "",

end_date:
  endDate?.format(
    "YYYY-MM-DDTHH:mm:ss"
  ) ?? "",
  }
);

      router.push("/events");
    } catch (error) {
      console.error(error);

      alert(
        "Failed to update event"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
  
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#7c3aed",
    },
  },
});
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-background border rounded-xl shadow p-8">

        <h1 className="text-3xl font-bold mb-6">
          Edit Event
        </h1>
<label className="block font-medium mb-2">
  Event Title
</label>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Enter a short and descriptive event title"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />
<label className="block font-medium mb-2">
  Description
</label>
          <textarea
            className="w-full border rounded-lg p-3"
            rows={4}
            placeholder= "Describe the event, schedule and purpose"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />
<label className="block font-medium mb-2">
  Location
</label>
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Enter venue name, hall, building or room number"
            value={location}
            onChange={(e) =>
              setLocation(
                e.target.value
              )
            }
          />
<label className="block font-medium mb-2">
  Image URL/ADDRESS
  <span className="text-sm text-muted-foreground ml-2">
    (Optional)
  </span>
</label>

<input
  className="w-full border rounded-lg p-3"
  placeholder="Paste banner image URL/ADDRESS"
  value={imageUrl}
  onChange={(e) =>
    setImageUrl(e.target.value)
  }
/>
          <div className="space-y-2">
  <label className="block font-medium">
    Start Date & Time
  </label>

  <ThemeProvider theme={muiTheme}>
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
    >
      <DateTimePicker
        value={startDate}
        onChange={(newValue) =>
          setStartDate(newValue)
        }
        slotProps={{
          textField: {
            fullWidth: true,
            sx: {
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  </ThemeProvider>

  <p className="text-sm text-muted-foreground">
    Select event start date and time.
  </p>
</div>

<div className="space-y-2 mt-6">
  <label className="block font-medium">
    End Date & Time
  </label>

  <ThemeProvider theme={muiTheme}>
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
    >
      <DateTimePicker
        value={endDate}
        onChange={(newValue) =>
          setEndDate(newValue)
        }
        slotProps={{
          textField: {
            fullWidth: true,
            sx: {
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  </ThemeProvider>

  <p className="text-sm text-muted-foreground">
    Must be later than the start date.
  </p>
</div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground rounded-lg p-3"
          >
            {submitting ? "Updating Event..." : "Update Event"}
          </button>
        </form>

      </div>
    </div>
  );
}
