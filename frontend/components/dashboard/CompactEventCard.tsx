import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";

type CompactEventCardProps = {
  item: {
    id: string;
    title: string;
    date?: string;
    location?: string;
  };
};

export default function CompactEventCard({
  item,
}: CompactEventCardProps) {
  return (
    <Link
      href="/events"
      className="
      block rounded-2xl border border-[#E8E1D5]
      bg-[#F8F5EF]
      p-4
      transition
      hover:shadow-md
      "
    >
      <h3 className="font-semibold text-[#183028]">
        {item.title}
      </h3>


      <div className="mt-3 flex flex-col gap-2 text-sm text-[#5E665F]">
        {item.date && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#0F4D3F]" />
            {item.date}
          </div>
        )}

        {item.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#0F4D3F]" />
            {item.location}
          </div>
        )}
      </div>
    </Link>
  );
}