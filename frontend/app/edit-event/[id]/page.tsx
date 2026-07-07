"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEvent, updateEvent } from "@/lib/api";
import dayjs, { Dayjs } from "dayjs";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#0F4D3F",
    },
  },
});

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[#5E665F]">
      {children}
    </label>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-[#E8E1D5] bg-white p-7 shadow-[0_18px_45px_rgba(15,77,63,0.07)]">
      <div className="mb-6">
        <h2 className="text-[1.25rem] font-semibold tracking-[-0.02em] text-[#183028]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#5E665F]">{description}</p>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    async function loadEvent() {
      try {
        const event = await getEvent(Number(id));

        setTitle(event.title || "");
        setDescription(event.description || "");
        setLocation(event.location || "");
        setImageUrl(event.image_url || "");
        setStartDate(dayjs(event.start_date));
        setEndDate(dayjs(event.end_date));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (submitting) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (startDate && endDate && endDate.isBefore(startDate)) {
      alert("End date must be after start date");
      return;
    }

    if (startDate && startDate.isBefore(dayjs())) {
      alert("Event cannot start in the past");
      return;
    }

    try {
      setSubmitting(true);

      await updateEvent(token, Number(id), {
        title,
        description,
        location,
        image_url: imageUrl.replace("Image URL:", "").trim(),
        start_date: startDate?.format("YYYY-MM-DDTHH:mm:ss") ?? "",
        end_date: endDate?.format("YYYY-MM-DDTHH:mm:ss") ?? "",
      });

      router.push("/events");
    } catch (error) {
      console.error(error);
      alert("Failed to update event");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FBF6] px-4 py-24">
        <div className="mx-auto max-w-5xl animate-pulse rounded-[2rem] border border-[#E8E1D5] bg-white p-10 shadow-[0_18px_45px_rgba(15,77,63,0.08)]">
          <div className="h-9 w-2/5 rounded-full bg-[#E8E1D5]" />
          <div className="mt-10 space-y-5">
            <div className="h-16 rounded-[18px] bg-[#F5F2EA]" />
            <div className="h-48 rounded-[18px] bg-[#F5F2EA]" />
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="h-14 rounded-[18px] bg-[#F5F2EA]" />
              <div className="h-14 rounded-[18px] bg-[#F5F2EA]" />
            </div>
            <div className="h-14 rounded-[18px] bg-[#F5F2EA]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7FBF6]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10 rounded-[2rem] border border-[#E8E1D5] bg-white p-8 shadow-[0_18px_45px_rgba(15,77,63,0.08)]">
          <p className="inline-flex rounded-full bg-[#F5F2EA] px-4 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#0F4D3F]">
            Event management
          </p>
          <h1 className="mt-7 font-serif text-[3.2rem] leading-[0.92] tracking-[-0.05em] text-[#183028]">
            Edit event details
         </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#5E665F]">
            Update the event identity, schedule, and venue with premium styling that matches your organizer dashboard.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.9fr_1fr]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Section
              title="Event details"
              description="Keep the core event information up to date so attendees always see the latest schedule and location."
            >
              <div className="grid gap-6">
                <div>
                  <Label>Event title</Label>
                  <Input
                    placeholder="Enter a short and descriptive event title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    rows={5}
                    placeholder="Describe the event, schedule and purpose"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label>Location</Label>
                    <Input
                      placeholder="Enter venue name, hall, building or room number"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Banner image URL</Label>
                    <Input
                      placeholder="Paste banner image URL / ADDRESS"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Section>

            <Section
              title="Schedule"
              description="Set the start and end times with precision so attendees can plan ahead."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <Label>Start date & time</Label>
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
                                borderRadius: "18px",
                                backgroundColor: "#FFFFFF",
                                "& fieldset": {
                                  borderColor: "#E8E1D5",
                                },
                                "&:hover fieldset": {
                                  borderColor: "#0F4D3F",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#0F4D3F",
                                  borderWidth: 2,
                                },
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
                  <p className="mt-2 text-sm text-[#5E665F]">Choose when the event will begin.</p>
                </div>

                <div>
                  <Label>End date & time</Label>
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
                                borderRadius: "18px",
                                backgroundColor: "#FFFFFF",
                                "& fieldset": {
                                  borderColor: "#E8E1D5",
                                },
                                "&:hover fieldset": {
                                  borderColor: "#0F4D3F",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#0F4D3F",
                                  borderWidth: 2,
                                },
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
                  <p className="mt-2 text-sm text-[#5E665F]">Must finish after the event start time.</p>
                </div>
              </div>
            </Section>

            <div className="rounded-[28px] border border-[#E8E1D5] bg-white p-6 shadow-[0_18px_45px_rgba(15,77,63,0.06)]">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#183028]">Save changes</h2>
                  <p className="mt-2 text-sm leading-6 text-[#5E665F]">
                    Submit the updated event and return to your events dashboard.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 rounded-full px-6 text-[#183028]"
                    onClick={() => router.push("/events")}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" className="h-12 rounded-full px-6" disabled={submitting}>
                    {submitting ? "Updating event..." : "Update event"}
                  </Button>
                </div>
              </div>
            </div>
          </form>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-[#E8E1D5] bg-white p-6 shadow-[0_18px_45px_rgba(15,77,63,0.06)]">
              <p className="text-sm uppercase tracking-[0.24em] text-[#5E665F]">Event snapshot</p>
              <h2 className="mt-4 text-2xl font-semibold text-[#183028]">Live preview</h2>
              <p className="mt-2 text-sm leading-6 text-[#5E665F]">Review the latest event metadata before publishing your update.</p>

              {imageUrl ? (
                <div className="mt-6 overflow-hidden rounded-[20px] border border-[#E8E1D5] bg-[#F7FAF6]">
                  <img src={imageUrl} alt={title || "Event banner"} className="h-44 w-full object-cover" />
                </div>
              ) : (
                <div className="mt-6 flex h-44 items-center justify-center rounded-[20px] border border-dashed border-[#D8E3D7] bg-[#F7FAF6] text-sm text-[#5E665F]">
                  No banner image provided
                </div>
              )}

              <div className="mt-6 space-y-4 text-sm text-[#5E665F]">
                <div className="rounded-[20px] bg-[#F5F2EA] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#8A918B]">Location</p>
                  <p className="mt-2 text-sm font-semibold text-[#183028]">{location || "Not set"}</p>
                </div>

                <div className="grid gap-3 rounded-[20px] border border-[#E8E1D5] bg-[#FAF8F4] p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8A918B]">Start</p>
                    <p className="mt-1 text-sm text-[#183028]">{startDate ? startDate.format("MMM D, YYYY h:mm A") : "Not scheduled"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8A918B]">End</p>
                    <p className="mt-1 text-sm text-[#183028]">{endDate ? endDate.format("MMM D, YYYY h:mm A") : "Not scheduled"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#E8E1D5] bg-[#F5F2EA] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-[#0F4D3F]">Tips</p>
              <ul className="mt-5 space-y-4 text-sm leading-6 text-[#5E665F]">
                <li className="rounded-[18px] bg-white p-4 shadow-[0_10px_24px_rgba(15,77,63,0.05)]">Use a concise title so attendees know the purpose immediately.</li>
                <li className="rounded-[18px] bg-white p-4 shadow-[0_10px_24px_rgba(15,77,63,0.05)]">Double-check start and end times to keep your event timeline accurate.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
