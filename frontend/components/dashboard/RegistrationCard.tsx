import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Calendar, MapPin } from "lucide-react";
import { RegistrationItem } from "./dashboardTypes";

export default function RegistrationCard({
  item,
}: {
  item: RegistrationItem;
}) {
  return (
    <Card className="h-full rounded-[24px] border border-[#E8E1D5] bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(15,77,63,0.08)]">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7C8B83]">
              Registration
            </p>

            <h3 className="mt-2 break-words text-lg font-semibold tracking-tight text-[#183028]">
              {item.title}
            </h3>
          </div>

          <div className="shrink-0 rounded-[16px] bg-[#F5F2EA] p-3 text-[#0F4D3F]">
            <Ticket className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm text-[#5E665F]">
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#0F4D3F]" />
            <span className="break-words">{item.date}</span>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0F4D3F]" />
            <span className="break-words">{item.location}</span>
          </div>

          <div className="inline-flex max-w-full rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
            {item.status}
          </div>
        </div>

        {item.passId && (
          <div className="mt-5">
            <Link href={`/pass/${item.passId}`} className="block sm:inline-block">
              <Button
                size="sm"
                variant="outline"
                className="w-full rounded-full sm:w-auto"
              >
                QR Pass
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}