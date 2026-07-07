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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type EventFormMode = "individual" | "team";

type EventFormProps = {
  mode: EventFormMode;
};

const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#0F4D3F",
    },
  },
});

function Section({
  title,
  description,
  iconNumber,
  children,
}: {
  title: string;
  description: string;
  iconNumber: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[#E8E1D5] bg-white p-8 shadow-[0_12px_32px_rgba(15,77,63,0.03)] transition-all duration-200">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F4D3F] text-xs font-semibold text-white">
          {iconNumber}
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-[#183028]">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#5E665F]">{description}</p>
        </div>
      </div>
      <hr className="mb-6 border-[#E8E1D5]" />
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-[#5E665F]">{children}</label>;
}

function ControlWrapper({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6">{children}</div>;
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
    "h-12 w-full rounded-[14px] border border-[#E8E1D5] bg-[#FAF8F4] px-4 text-[#183028] placeholder:text-[#8A918B] transition-all duration-200 focus:border-[#0F4D3F] focus:ring-2 focus:ring-[#0F4D3F]/15 outline-none";

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-[#183028] lg:text-4xl">
              {isTeamEvent ? "Team Event" : "Individual Event"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#5E665F]">
              Fill in the details below to create and schedule a new event.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-10 space-y-6 pb-28">
            <Section iconNumber={1} title="Event Information" description="Set the identity and banner for the event.">
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
                  <Textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the event, schedule and purpose"
                    className="min-h-[140px] w-full resize-none break-words rounded-[14px] border border-[#E8E1D5] bg-[#FAF8F4] p-4 text-[#183028] placeholder:text-[#8A918B] transition-all duration-200 focus:border-[#0F4D3F] focus:ring-2 focus:ring-[#0F4D3F]/15 outline-none"
                  />
                </div>

                <div className="space-y-4 rounded-[14px] border border-dashed border-[#E8E1D5] bg-[#FAF8F4] p-5">

  <div>
    <Label>Banner Image</Label>

    <p className="max-w-xl text-xs leading-5 text-[#5E665F]">
      Paste a hosted image URL to preview.
    </p>
  </div>

  <Input
    type="text"
    value={imageUrl}
    onChange={(e) => setImageUrl(e.target.value)}
    placeholder="Paste image URL e.g. https://example.com/banner.jpg"
    className="h-12 w-full rounded-[14px] border border-[#E8E1D5] bg-white px-4 text-[#183028] placeholder:text-[#8A918B] transition-all duration-200 focus:border-[#0F4D3F] focus:ring-2 focus:ring-[#0F4D3F]/15 outline-none"
  />

</div>
              </ControlWrapper>
            </Section>

            <Section iconNumber={2} title="Schedule" description="Choose the timeline and registration window.">
              <div className="grid gap-6 md:grid-cols-3">
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
                                borderRadius: "14px",
                                height: 48,
                                backgroundColor: "#FAF8F4",
                                "& fieldset": { borderColor: "#E8E1D5" },
                                "&:hover fieldset": { borderColor: "#0F4D3F" },
                                "&.Mui-focused fieldset": { borderColor: "#0F4D3F", borderWidth: 2 },
                              },
                              "& .MuiInputBase-input": { padding: "12px 14px", color: "#183028" },
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
                                borderRadius: "14px",
                                height: 48,
                                backgroundColor: "#FAF8F4",
                                "& fieldset": { borderColor: "#E8E1D5" },
                                "&:hover fieldset": { borderColor: "#0F4D3F" },
                                "&.Mui-focused fieldset": { borderColor: "#0F4D3F", borderWidth: 2 },
                              },
                              "& .MuiInputBase-input": { padding: "12px 14px", color: "#183028" },
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
                                borderRadius: "14px",
                                height: 48,
                                backgroundColor: "#FAF8F4",
                                "& fieldset": { borderColor: "#E8E1D5" },
                                "&:hover fieldset": { borderColor: "#0F4D3F" },
                                "&.Mui-focused fieldset": { borderColor: "#0F4D3F", borderWidth: 2 },
                              },
                              "& .MuiInputBase-input": { padding: "12px 14px", color: "#183028" },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </ThemeProvider>
                </div>
              </div>
            </Section>

            <Section iconNumber={3} title="Location" description="Set the location and capacity limits for the event.">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label>Venue Location</Label>
                  <Input
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
                    <Label>Maximum Capacity</Label>
                    <Input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                ) : null}
              </div>
            </Section>

            <Section iconNumber={4} title="Registration Settings" description="Set whether the event is free or paid.">
              <div className="space-y-6">
                <label className="flex items-start gap-4 rounded-[14px] border border-[#E8E1D5] bg-[#FAF8F4] px-5 py-4 transition-all duration-200 hover:border-[#0F4D3F]/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPaidEvent}
                    onChange={(e) => setIsPaidEvent(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#0F4D3F]"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-[#183028]">
                      Require Paid Tickets
                    </h3>
                    <p className="mt-0.5 text-xs text-[#5E665F]">
                      Charge attendees a registration fee to book their slots.
                    </p>
                  </div>
                </label>

                {isPaidEvent ? (
                  <div className="max-w-xs animate-in fade-in duration-200">
                    <Label>Registration Fee (₹)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Enter amount"
                      value={registrationFee}
                      onChange={(e) => setRegistrationFee(e.target.value.replace(/\D/g, ""))}
                      className={inputClass}
                    />
                  </div>
                ) : null}
              </div>
            </Section>

            {isTeamEvent ? (
              <Section iconNumber={5} title="Team Settings" description="Set the member limits and team capacity constraints.">
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <Label>Minimum Team Size</Label>
                    <Input
                      type="number"
                      value={minTeamSize}
                      onChange={(e) => setMinTeamSize(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <Label>Maximum Team Size</Label>
                    <Input
                      type="number"
                      value={maxTeamSize}
                      onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <Label>Maximum Teams Limit</Label>
                    <Input
                      type="number"
                      value={maxTeams}
                      onChange={(e) => setMaxTeams(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                </div>
              </Section>
            ) : null}

            {/* Form Footer Action Controls */}
            <div className="sticky bottom-0 left-0 z-20 border-t border-[#E8E1D5] bg-[#FAF8F4]/90 px-6 py-4 backdrop-blur-md shadow-[0_-10px_30px_rgba(15,77,63,0.04)] sm:px-0">
              <div className="mx-auto flex max-w-4xl justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-full border border-[#E8E1D5] bg-white px-6 text-sm font-medium text-[#183028] hover:bg-[#FAF8F4]"
                  onClick={() => router.push("/create-event")}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={loading || submitting}
                  className="h-10 rounded-full bg-[#0F4D3F] px-6 text-sm font-medium text-white hover:bg-[#0A352B] disabled:opacity-50"
                >
                  {loading || submitting ? "Creating Event..." : "Create Event"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}