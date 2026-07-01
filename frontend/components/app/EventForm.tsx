"use client";

import dayjs, { Dayjs } from "dayjs";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createEvent } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type EventFormMode = "individual" | "team";

type EventFormProps = {
  mode: EventFormMode;
};

const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#7c3aed",
    },
  },
});

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-sm font-medium text-foreground">{children}</label>;
}

function ControlWrapper({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

export default function EventForm({ mode }: EventFormProps) {
  const router = useRouter();
  const isTeamEvent = mode === "team";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [capacity, setCapacity] = useState(100);
  const [minTeamSize, setMinTeamSize] = useState(2);
  const [maxTeamSize, setMaxTeamSize] = useState(6);
  const [isPaidEvent, setIsPaidEvent] = useState(false);
  const [registrationFee, setRegistrationFee] = useState("");
  const [maxTeams, setMaxTeams] = useState(50);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [registrationDeadline, setRegistrationDeadline] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login");
        return;
      }

      if (startDate && endDate && endDate <= startDate) {
        toast.error("End date must be after start date");
        return;
      }

      if (isTeamEvent && minTeamSize > maxTeamSize) {
        toast.error("Minimum team size cannot be greater than maximum team size");
        return;
      }

      if (startDate && startDate.isBefore(dayjs())) {
        toast.error("Event cannot start in the past");
        return;
      }

      if (registrationDeadline && startDate && registrationDeadline >= startDate) {
        toast.error("Registration deadline must be before event start");
        return;
      }

      if (isPaidEvent && (!registrationFee || Number(registrationFee) <= 0)) {
        toast.error("Enter a valid registration fee");
        return;
      }

      setLoading(true);
      setSubmitting(true);

      await createEvent(token, {
        title,
        description,
        location,
        image_url: imageUrl.trim() || undefined,
        capacity,
        start_date: startDate?.format("YYYY-MM-DDTHH:mm:ss") ?? "",
        end_date: endDate?.format("YYYY-MM-DDTHH:mm:ss") ?? "",
        is_paid_event: isPaidEvent,
        registration_fee: Number(registrationFee),
        registration_deadline: registrationDeadline?.format("YYYY-MM-DDTHH:mm:ss") ?? "",
        is_team_event: isTeamEvent,
        min_team_size: minTeamSize,
        max_team_size: maxTeamSize,
        max_teams: isTeamEvent ? maxTeams : undefined,
      });

      toast.success(`"${title}" created successfully!`);
      router.push("/events");

      setTitle("");
      setDescription("");
      setLocation("");
      setImageUrl("");
      setCapacity(100);
      setMinTeamSize(1);
      setMaxTeamSize(6);
      setMaxTeams(50);
      setIsPaidEvent(false);
      setRegistrationFee("");
      setStartDate(null);
      setEndDate(null);
      setRegistrationDeadline(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create event");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-2xl border border-border/70 bg-background px-4 shadow-none outline-none transition-colors duration-200 placeholder:text-muted-foreground/60 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20";

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_80%_24%,rgba(59,130,246,0.10),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.08),transparent_26%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.16),transparent_28%),radial-gradient(circle_at_80%_24%,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.10),transparent_26%)]" />

        <div className="mx-auto max-w-4xl px-6 py-8 lg:py-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold tracking-tight lg:text-6xl">
              {isTeamEvent ? "Team Event" : "Individual Event"}
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-muted-foreground">
              Fill in the details below to create and schedule a new event.
            </p>
          </div>
         <form onSubmit={handleSubmit} className="mt-16 space-y-10 pb-32">
            <Section title="Basic Information" description="Set the identity and banner for the event.">
              <ControlWrapper>
                <div>
                  <Label>Event Title</Label>
                  <Input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a short and descriptive event title"
                    className={inputClass}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the event, schedule and purpose"
                    className={`${inputClass} min-h-[160px] py-3`}
                  />
                </div>

                <div>
                  <Label>Banner</Label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste banner image URL/ADDRESS"
                    className={inputClass}
                  />
                </div>
              </ControlWrapper>
            </Section>

            <Section title="Schedule" description="Choose the timeline and registration window.">
              <div className="grid gap-8 md:grid-cols-3">
                <div>
                  <Label>Registration Deadline</Label>
                  <ThemeProvider theme={muiTheme}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        value={registrationDeadline}
                        onChange={(newValue) => setRegistrationDeadline(newValue)}
                        slotProps={{
  textField: {
    fullWidth: true,
    sx: {
      "& .MuiOutlinedInput-root": {
        borderRadius: "16px",
        height: 56,
      },
      "& .MuiInputBase-input": {
        padding: "16px 14px",
      },
    },
  },
}}
                      />
                    </LocalizationProvider>
                  </ThemeProvider>
                </div>

                <div>
                  <Label>Start Date & Time</Label>
                  <ThemeProvider theme={muiTheme}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        slotProps={{
  textField: {
    fullWidth: true,
    sx: {
      "& .MuiOutlinedInput-root": {
        borderRadius: "16px",
        height: 56,
      },
      "& .MuiInputBase-input": {
        padding: "16px 14px",
      },
    },
  },
}}
                      />
                    </LocalizationProvider>
                  </ThemeProvider>
                </div>

                <div>
                  <Label>End Date & Time</Label>
                  <ThemeProvider theme={muiTheme}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        slotProps={{
  textField: {
    fullWidth: true,
    sx: {
      "& .MuiOutlinedInput-root": {
        borderRadius: "16px",
        height: 56,
      },
      "& .MuiInputBase-input": {
        padding: "16px 14px",
      },
    },
  },
}}
                      />
                    </LocalizationProvider>
                  </ThemeProvider>
                </div>
              </div>
            </Section>

            <Section title="Location & Capacity" description="Set the location and capacity for the event.">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <Label>Location</Label>
                  <input
                    required
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter venue name, hall, building or room number"
                    className={inputClass}
                  />
                </div>

                {!isTeamEvent ? (
                  <div>
                    <Label>Capacity</Label>
                    <input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                ) : null}
              </div>
            </Section>

            {isTeamEvent ? (
              <Section title="Team Settings" description="Set the member limits and team capacity.">
                <div className="grid gap-8 md:grid-cols-3">
                  <div>
                    <Label>Minimum Team Size</Label>
                    <input
                      type="number"
                      value={minTeamSize}
                      onChange={(e) => setMinTeamSize(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <Label>Maximum Team Size</Label>
                    <input
                      type="number"
                      value={maxTeamSize}
                      onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <Label>Maximum Teams</Label>
                    <input
                      type="number"
                      value={maxTeams}
                      onChange={(e) => setMaxTeams(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                </div>
              </Section>
            ) : null}

            <Section title="Pricing" description="Set whether the event is free or paid.">
              <div className="space-y-5">
                <label className="flex items-start gap-4 rounded-2xl border border-border/70 bg-background px-6 py-5 transition-colors hover:border-violet-300">
                  <input
                    type="checkbox"
                    checked={isPaidEvent}
                    onChange={(e) => setIsPaidEvent(e.target.checked)}
                    className="mt-2"
                  />
                  <div>
  <h3 className="font-semibold text-foreground">
    Paid Event
  </h3>

  <p className="mt-1 text-sm text-muted-foreground">
    Charge attendees a registration fee.
  </p>
</div>
                </label>

                {isPaidEvent ? (
                  <div>
                    <Label>Registration Fee (₹)</Label>
                    <input
  type="number"
  min="0"
  placeholder="Enter the amount to be charged"
  value={registrationFee}
  onChange={(e) => setRegistrationFee(e.target.value.replace(/\D/g, ""))}
  className={inputClass}
/>
                  </div>
                ) : null}
              </div>
            </Section>

            <div className="mt-10 flex justify-end gap-4">
  <Button
    type="button"
    variant="outline"
    className="h-12 rounded-full px-7 font-medium"
    onClick={() => router.push("/create-event")}
  >
    Cancel
  </Button>

  <Button
    type="submit"
    disabled={loading || submitting}
    className="h-12 rounded-full px-7 font-medium"
  >
    {loading || submitting ? "Creating Event..." : "Create Event"}
  </Button>
</div>
          </form>
        </div>
      </div>
    </main>
  );
}
