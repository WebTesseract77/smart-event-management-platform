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
        block
        rounded-2xl
        border
        border-[#E8E1D5]
        bg-[#F8F5EF]
        p-3
        sm:p-4
        transition
        hover:shadow-md
      "
    >
      <h3 className="line-clamp-2 break-words text-[15px] font-semibold text-[#183028] sm:text-base">
        {item.title}
      </h3>

      <div className="mt-3 flex flex-col gap-2 text-[13px] text-[#5E665F] sm:text-sm">
        {item.date && (
          <div className="flex items-center gap-2 break-words">
            <Calendar className="h-4 w-4 shrink-0 text-[#0F4D3F]" />
            <span className="break-words">{item.date}</span>
          </div>
        )}

        {item.location && (
          <div className="flex items-center gap-2 break-words">
            <MapPin className="h-4 w-4 shrink-0 text-[#0F4D3F]" />
            <span className="break-words">{item.location}</span>
          </div>
        )}
      </div>
    </Link>
  );
}