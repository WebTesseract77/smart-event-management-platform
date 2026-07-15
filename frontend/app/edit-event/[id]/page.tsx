"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getEvent, updateEvent } from "@/lib/api";
import dayjs, { Dayjs } from "dayjs";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { Upload, X, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

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

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Shared MUI DateTimePicker sx — identical to Create Event so both pages
// render pixel-for-pixel the same field.
const datePickerSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    width: "100%",
    borderRadius: "14px",
    height: 48,
    backgroundColor: "#FAF8F4",
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
    padding: "12px 14px",
    color: "#183028",
  },
};

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
    <section className="rounded-[28px] border border-[#E8E1D5] bg-white p-5 sm:p-8 shadow-[0_12px_32px_rgba(15,77,63,0.03)] transition-all duration-200">
      <div className="mb-6 flex flex-col sm:flex-row items-start gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F4D3F] text-xs font-semibold text-white">
          {iconNumber}
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-[#183028]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#5E665F]">{description}</p>
        </div>
      </div>
      <hr className="my-5 border-[#E8E1D5]" />
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-[#5E665F]">
      {children}
    </label>
  );
}

function ControlWrapper({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6">{children}</div>;
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "green" | "amber" }) {
  const toneClass =
    tone === "green"
      ? "bg-[#ECF7EE] text-[#0F4D3F] border-[#D1ECD5]"
      : "bg-[#FFF6E7] text-[#A9771E] border-[#FCECD3]";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${toneClass}`}>
      {children}
    </span>
  );
}

const inputClass =
  "h-12 w-full rounded-[14px] border border-[#E8E1D5] bg-[#FAF8F4] px-4 text-[#183028] placeholder:text-[#8A918B] transition-all duration-200 focus:border-[#0F4D3F] focus:ring-2 focus:ring-[#0F4D3F]/15 outline-none";

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
  const [registrationDeadline, setRegistrationDeadline] = useState<Dayjs | null>(null);

  // Read-only context pulled from the event for the live preview badges.
  // Not editable on this page — mirrors what Create Event captures at
  // creation time, displayed here for parity/context only.
  const [isPaidEvent, setIsPaidEvent] = useState(false);
  const [isTeamEvent, setIsTeamEvent] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chooseImageButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    async function loadEvent() {
      try {
        const event = await getEvent(Number(id));

        setTitle(event.title || "");
        setDescription(event.description || "");
        setLocation(event.location || "");
        setImageUrl(event.image_url || "");
        setStartDate(event.start_date ? dayjs(event.start_date) : null);
        setEndDate(event.end_date ? dayjs(event.end_date) : null);
        setRegistrationDeadline(event.registration_deadline ? dayjs(event.registration_deadline) : null);
        setIsPaidEvent(Boolean(event.is_paid_event));
        setIsTeamEvent(Boolean(event.is_team_event));
        setLastUpdated(event.updated_at || event.created_at || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prevent multiple uploads from firing at the same time
    if (uploadingImage) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP images are allowed");
      resetFileInput();
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image must be smaller than 5MB");
      resetFileInput();
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Image upload is not configured");
      resetFileInput();
      return;
    }

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setImageUrl(data.secure_url);
    } catch (error) {
      console.error(error);
      // Preserve the previous image on failure — imageUrl is untouched here.
      toast.error(imageUrl ? "Failed to upload image. Your previous image has been kept." : "Failed to upload image");
    } finally {
      setUploadingImage(false);
      resetFileInput();
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    resetFileInput();
    chooseImageButtonRef.current?.focus();
  };

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
      toast.error("End date must be after start date");
      return;
    }

    if (startDate && startDate.isBefore(dayjs())) {
      toast.error("Event cannot start in the past");
      return;
    }

    if (registrationDeadline && startDate && registrationDeadline.isSame(startDate)) {
      toast.error("Registration deadline must be before event start");
      return;
    }

    if (registrationDeadline && startDate && registrationDeadline.isAfter(startDate)) {
      toast.error("Registration deadline must be before event start");
      return;
    }

    try {
      setSubmitting(true);

      await updateEvent(token, Number(id), {
        title,
        description,
        location,
        image_url: imageUrl.trim() || undefined,
        start_date: startDate?.format("YYYY-MM-DDTHH:mm:ss") ?? "",
        end_date: endDate?.format("YYYY-MM-DDTHH:mm:ss") ?? "",
        registration_deadline: registrationDeadline?.format("YYYY-MM-DDTHH:mm:ss") ?? "",
      });

      toast.success(`"${title}" updated successfully!`);
      router.push("/events");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update event");
    } finally {
      setSubmitting(false);
    }
  }

  const eventStatus = (() => {
    if (!startDate || !endDate) return "Not scheduled";
    const now = dayjs();
    if (now.isBefore(startDate)) return "Upcoming";
    if (now.isAfter(endDate)) return "Ended";
    return "Ongoing";
  })();

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F4]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="animate-pulse rounded-[28px] border border-[#E8E1D5] bg-white p-8 shadow-[0_18px_45px_rgba(15,77,63,0.08)]">
            <div className="h-9 w-2/5 rounded-full bg-[#E8E1D5]" />
            <div className="mt-10 space-y-5">
              <div className="h-16 rounded-[18px] bg-[#F5F2EA]" />
              <div className="h-48 rounded-[18px] bg-[#F5F2EA]" />
              <div className="grid gap-5 lg:grid-cols-3">
                <div className="h-14 rounded-[18px] bg-[#F5F2EA]" />
                <div className="h-14 rounded-[18px] bg-[#F5F2EA]" />
                <div className="h-14 rounded-[18px] bg-[#F5F2EA]" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full bg-[#F5F2EA] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#0F4D3F]">
            Event management
          </p>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#183028] lg:text-4xl">Edit Event</h1>
          <p className="mt-2 text-sm leading-6 text-[#5E665F]">
            Update the event identity, schedule, and venue with the same premium styling as event creation.
          </p>
          {lastUpdated ? (
            <p className="mt-3 text-xs font-medium text-[#8A918B]">
              Last saved: {dayjs(lastUpdated).format("MMM D, YYYY h:mm A")}
            </p>
          ) : null}
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.9fr_1fr]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Section iconNumber={1} title="Event Information" description="Keep the core identity and banner up to date.">
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
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the event, schedule and purpose"
                    className="min-h-[140px] w-full resize-none break-words rounded-[14px] border border-[#E8E1D5] bg-[#FAF8F4] p-4 text-[#183028] placeholder:text-[#8A918B] transition-all duration-200 focus:border-[#0F4D3F] focus:ring-2 focus:ring-[#0F4D3F]/15 outline-none"
                  />
                </div>

                <div
                  className="space-y-4 rounded-[14px] border border-dashed border-[#E8E1D5] bg-[#FAF8F4] p-5"
                  aria-busy={uploadingImage}
                >
                  <div>
                    <Label htmlFor="banner-image-input">Banner Image</Label>
                    <p className="max-w-xl text-xs leading-5 text-[#5E665F]">
                      Upload an image from your device to use as the event banner. JPG, PNG or WEBP, up to 5MB.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    id="banner-image-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelect}
                    disabled={uploadingImage}
                    className="hidden"
                    aria-label="Choose banner image file"
                  />

                  <span className="sr-only" role="status" aria-live="polite">
                    {uploadingImage ? "Uploading banner image, please wait." : ""}
                  </span>

                  {!imageUrl ? (
                    <Button
                      ref={chooseImageButtonRef}
                      type="button"
                      variant="outline"
                      disabled={uploadingImage}
                      aria-disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-12 items-center gap-2 rounded-[14px] border border-[#E8E1D5] bg-white px-5 text-sm font-medium text-[#183028] transition-all duration-200 hover:bg-[#FAF8F4] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" aria-hidden="true" />
                          Choose Image
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative w-full overflow-hidden rounded-[14px] border border-[#E8E1D5] bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt="Event banner preview"
                          className="h-48 w-full object-cover sm:h-64 md:h-72"
                        />

                        {uploadingImage ? (
                          <div
                            className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm transition-opacity duration-200"
                            role="status"
                            aria-live="polite"
                          >
                            <div className="flex flex-col items-center gap-2 text-[#0F4D3F]">
                              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
                              <span className="text-xs font-medium">Uploading...</span>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingImage}
                          aria-disabled={uploadingImage}
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex h-10 items-center gap-2 rounded-full border border-[#E8E1D5] bg-white px-5 text-sm font-medium text-[#183028] transition-all duration-200 hover:bg-[#FAF8F4] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <RefreshCw className="h-4 w-4" aria-hidden="true" />
                          Replace Image
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingImage}
                          aria-disabled={uploadingImage}
                          onClick={handleRemoveImage}
                          aria-label="Remove banner image"
                          className="inline-flex h-10 items-center gap-2 rounded-full border border-[#E8E1D5] bg-white px-5 text-sm font-medium text-[#183028] transition-all duration-200 hover:bg-[#FAF8F4] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                          Remove Image
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </ControlWrapper>
            </Section>

            <Section iconNumber={2} title="Schedule" description="Adjust the registration window and event timeline.">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                            sx: datePickerSx,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </ThemeProvider>
                  <p className="mt-2 text-sm text-[#5E665F]">
                    Registrations automatically close after this date and time.
                  </p>
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
                            sx: datePickerSx,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </ThemeProvider>
                  <p className="mt-2 text-sm text-[#5E665F]">Choose when the event will begin.</p>
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
                            sx: datePickerSx,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </ThemeProvider>
                  <p className="mt-2 text-sm text-[#5E665F]">Must finish after the event start time.</p>
                </div>
              </div>
            </Section>

            <Section iconNumber={3} title="Location" description="Update the venue for this event.">
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
            </Section>

            {/* Action card — final section of the form, styled like every other section */}
            <section className="rounded-[28px] border border-[#E8E1D5] bg-white p-6 sm:p-8 shadow-[0_12px_32px_rgba(15,77,63,0.03)]">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-[-0.01em] text-[#183028]">Action</h2>
                  <p className="mt-1 text-sm leading-6 text-[#5E665F]">
                    Review your changes before saving.
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    className="w-full sm:w-auto h-10 rounded-full border border-[#E8E1D5] bg-white px-6 text-sm font-medium text-[#183028] hover:bg-[#FAF8F4] disabled:opacity-50"
                    onClick={() => router.push("/events")}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto h-10 rounded-full bg-[#0F4D3F] px-6 text-sm font-medium text-white hover:bg-[#0A352B] disabled:opacity-50"
                  >
                    {submitting ? "Updating Event..." : "Update Event"}
                  </Button>
                </div>
              </div>
            </section>
          </form>

          {/* Live preview sidebar */}
          <aside className="space-y-6">
            <div className="rounded-[28px] border border-[#E8E1D5] bg-white p-6 shadow-[0_18px_45px_rgba(15,77,63,0.06)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[#5E665F]">Event snapshot</p>
              <h2 className="mt-4 text-2xl font-semibold text-[#183028]">Live preview</h2>
              <p className="mt-2 text-sm leading-6 text-[#5E665F]">
                Review the latest event metadata before publishing your update.
              </p>

              {imageUrl ? (
                <div className="mt-6 overflow-hidden rounded-[20px] border border-[#E8E1D5] bg-[#F7FAF6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt={title || "Event banner"} className="h-44 w-full object-cover" />
                </div>
              ) : (
                <div className="mt-6 flex h-44 items-center justify-center rounded-[20px] border border-dashed border-[#D8E3D7] bg-[#F7FAF6] text-sm text-[#5E665F]">
                  No banner image provided
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <Badge tone={isPaidEvent ? "amber" : "green"}>{isPaidEvent ? "Paid" : "Free"}</Badge>
                <Badge tone="green">{isTeamEvent ? "Team" : "Individual"}</Badge>
                <Badge tone="green">{eventStatus}</Badge>
              </div>

              <div className="mt-6 space-y-4 text-sm text-[#5E665F]">
                <div className="rounded-[20px] bg-[#F5F2EA] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#8A918B]">Title</p>
                  <p className="mt-2 text-sm font-semibold text-[#183028]">{title || "Untitled event"}</p>
                </div>

                <div className="rounded-[20px] bg-[#F5F2EA] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#8A918B]">Location</p>
                  <p className="mt-2 text-sm font-semibold text-[#183028]">{location || "Not set"}</p>
                </div>

                <div className="grid gap-3 rounded-[20px] border border-[#E8E1D5] bg-[#FAF8F4] p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8A918B]">Registration Deadline</p>
                    <p className="mt-1 text-sm text-[#183028]">
                      {registrationDeadline ? registrationDeadline.format("MMM D, YYYY h:mm A") : "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8A918B]">Start</p>
                    <p className="mt-1 text-sm text-[#183028]">
                      {startDate ? startDate.format("MMM D, YYYY h:mm A") : "Not scheduled"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8A918B]">End</p>
                    <p className="mt-1 text-sm text-[#183028]">
                      {endDate ? endDate.format("MMM D, YYYY h:mm A") : "Not scheduled"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#E8E1D5] bg-[#F5F2EA] p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-[#0F4D3F]">Tips</p>
              <ul className="mt-5 space-y-4 text-sm leading-6 text-[#5E665F]">
                <li className="rounded-[18px] bg-white p-4 shadow-[0_10px_24px_rgba(15,77,63,0.05)]">
                  Use a concise title so attendees know the purpose immediately.
                </li>
                <li className="rounded-[18px] bg-white p-4 shadow-[0_10px_24px_rgba(15,77,63,0.05)]">
                  Double-check start, end and deadline times to keep your event timeline accurate.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}