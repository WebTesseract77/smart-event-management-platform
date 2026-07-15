"use client";

import dayjs, { Dayjs } from "dayjs";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Link from "next/link";
import { Upload, X, Loader2, RefreshCw } from "lucide-react";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
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

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

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
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-[#183028]">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#5E665F]">{description}</p>
        </div>
      </div>
      <hr className="my-5 border-[#E8E1D5]" />
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-[#5E665F]"
    >
      {children}
    </label>
  );
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chooseImageButtonRef = useRef<HTMLButtonElement>(null);
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

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setImageUrl(data.secure_url);
    } catch (error) {
      console.error(error);
      toast.error(
        imageUrl
          ? "Failed to upload image. Your previous image has been kept."
          : "Failed to upload image"
      );
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
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-[#183028] lg:text-4xl">
              {isTeamEvent ? "Team Event" : "Individual Event"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#5E665F]">
              Fill in the details below to create and schedule a new event.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
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

            <Section iconNumber={2} title="Schedule" description="Choose the timeline and registration window.">
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
                            sx: {
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                <label className="flex flex-col sm:flex-row items-start gap-4 rounded-[14px] border border-[#E8E1D5] bg-[#FAF8F4] px-5 py-4 transition-all duration-200 hover:border-[#0F4D3F]/30 cursor-pointer">
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
                  <div className="w-full sm:max-w-xs animate-in fade-in duration-200">
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

            {/* Action Card — matches Edit Event page */}
            <section className="rounded-[28px] border border-[#E8E1D5] bg-white p-5 sm:p-8 shadow-[0_12px_32px_rgba(15,77,63,0.03)] transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h2 className="text-xl font-semibold tracking-[-0.01em] text-[#183028]">
                    Action
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[#5E665F]">
                    Review your event before publishing.
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto h-10 rounded-full border border-[#E8E1D5] bg-white px-6 text-sm font-medium text-[#183028] hover:bg-[#FAF8F4]"
                    onClick={() => router.push("/create-event")}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={loading || submitting}
                    className="w-full sm:w-auto h-10 rounded-full bg-[#0F4D3F] px-6 text-sm font-medium text-white hover:bg-[#0A352B] disabled:opacity-50"
                  >
                    {loading || submitting ? "Creating Event..." : "Create Event"}
                  </Button>
                </div>
              </div>
            </section>
          </form>
        </div>
      </div>
    </main>
  );
}