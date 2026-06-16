"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Pencil,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  image_url?: string | null;
  capacity: number;
  registered_count: number;

  is_team_event: boolean;
  min_team_size: number;
  max_team_size: number;
}
interface EventCardProps {
  event: Event;
  isAdmin: boolean;
  isRegistered: boolean;
  onRegister: (eventId: number) => void;
  onDelete: (eventId: number) => void;
}

export default function EventCard({
  event,
  isAdmin,
  isRegistered,
  onRegister,
  onDelete,
}: EventCardProps) {
    const now = new Date();

const start = new Date(
  event.start_date
);

const end = new Date(
  event.end_date
);
const isCompleted =
  now > end;
let status = "Upcoming";
let badgeClass =
  "bg-blue-100 text-blue-700";

if (
  now >= start &&
  now <= end
) {
  status = "Live";
  badgeClass =
    "bg-green-100 text-green-700";
}

if (now > end) {
  status = "Completed";
  badgeClass =
    "bg-gray-100 text-gray-700";
}
const occupancy =
  (event.registered_count /
    event.capacity) *
  100;
  return (
 <Card
  className="
    h-full
    flex
    flex-col
    rounded-2xl
    overflow-hidden
    shadow-sm
    hover:shadow-md
    transition-all
    duration-300
    hover:-translate-y-1
  "
>
      {event.image_url ? (
        <img
          src={event.image_url}
          alt={event.title}
          className="h-32 w-full object-cover"
        />
      ) : (
        <div className="h-32 bg-gradient-to-r from-blue-600 to-violet-600" />
      )}
<CardHeader>
  <div className="flex justify-between items-start">

    <CardTitle className="text-xl">
      {event.title}
    </CardTitle>

    <div className="flex gap-2">

      <Badge className={badgeClass}>
        {status}
      </Badge>

      {event.is_team_event && (
        <Badge
  className="
    bg-violet-100
    text-violet-700
    hover:bg-violet-100
  "
>
  Team Event
</Badge>
      )}

    </div>

  </div>
</CardHeader>

      <CardContent
  className="
    flex
    flex-col
    flex-1
  "
>
 <p
  className="
    text-muted-foreground
    mb-4
    line-clamp-3
    break-words
  "
>
  {event.description}
</p>
        <div className="space-y-3 mb-6">

          <div className="flex items-start gap-2 text-sm">
  <MapPin className="w-4 h-4 text-violet-600 mt-1 shrink-0" />

  <span className="text-muted-foreground">
    {event.location.length > 50
      ? event.location.substring(0, 50) + "..."
      : event.location}
  </span>
</div>
<div className="mt-2">
  <div className="flex justify-between text-xs text-muted-foreground mb-1">
    <span>
      Seats Left: {
        event.capacity -
        event.registered_count
      }
    </span>

    <span>
      {Math.round(
        occupancy
      )}%
    </span>
  </div>

  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
    <div
      className="h-full bg-violet-600 transition-all duration-300"
      style={{
        width: `${occupancy}%`,
      }}
    />
  </div>
</div>
<div className="flex items-center gap-2 text-sm">
  <Calendar className="w-4 h-4 text-violet-600" />
  <span>
  {new Date(
    event.start_date
  ).toLocaleString(
    "en-IN",
    {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }
  )}
</span>
</div>

<div className="flex items-center gap-2 text-sm">
  <Users className="w-4 h-4 text-violet-600" />
  <span>
    Capacity: {event.capacity}
  </span>

</div>

        </div>

        <div className="mt-auto flex flex-wrap gap-2">

          <Link
            href={`/events/${event.id}`}
          >
            <Button size="sm">
              View
            </Button>
          </Link>

         {isRegistered ? (
<Button
  size="sm"
  variant="default"
>
  Registered
</Button>
) : (
  <Button
    size="sm"
    variant="outline"
    disabled={
      event.registered_count >=
        event.capacity ||
      isCompleted
    }
    onClick={() => {
      if (event.is_team_event) {
        window.location.href =
          `/team-register/${event.id}`;
      } else {
        onRegister(event.id);
      }
    }}
  >
    <UserPlus className="w-4 h-4 mr-1" />

    {isCompleted
      ? "Ended"
      : event.registered_count >=
        event.capacity
      ? "Full"
      : event.is_team_event
      ? "Register Team"
      : "Register"}
  </Button>
)}
          {isAdmin && !isCompleted && (
  <>
              <Link
                href={`/edit-event/${event.id}`}
              >
                <Button
                  size="sm"
                  variant="secondary"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </Link>

              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  onDelete(event.id)
                }
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>

              <Link
                href={`/attendance/${event.id}`}
              >
                <Button
                  size="sm"
                  variant="outline"
                >
                  Attendance
                </Button>
              </Link>
            </>
          )}

        </div>
      </CardContent>
    </Card>
  );
}