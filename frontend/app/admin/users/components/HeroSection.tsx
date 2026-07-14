import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Users, UserStar, ClipboardList } from "lucide-react";

interface HeroSectionProps {
  stats: {
    total: number;
    admins: number;
    organizers: number;
    pendingRequests: number;
  };
}

export function HeroSection({ stats }: HeroSectionProps) {
  return (
    <Card className="overflow-hidden rounded-[24px] md:rounded-[34px] border border-[#E8E1D5] bg-white shadow-[0_12px_28px_rgba(24,48,40,.05)] w-full">
      <CardContent className="p-5 sm:p-10 w-full">
        <div className="grid lg:grid-cols-[420px_1fr] items-center gap-6 lg:gap-12 w-full">

          {/* LEFT */}
          <div className="max-w-[480px] w-full">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E1D5] bg-[#F8F6EF] px-4 py-2 text-xs sm:text-sm font-medium text-[#183028]">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Admin user management
            </div>

            <h1 className="mt-4 sm:mt-7 font-serif text-3xl sm:text-4xl lg:text-[3.2rem] lg:leading-[0.92] tracking-[-0.05em] text-[#183028]">
              Manage users
            </h1>

            <p className="mt-3 sm:mt-7 text-sm sm:text-[18px] sm:leading-8 text-[#5E665F]">
              Promote trusted users to organizers or demote organizers back to standard user access.
            </p>
          </div>

          {/* RIGHT */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
            {[
              { label: "TOTAL USERS", value: stats.total, icon: Users },
              { label: "ADMINS", value: stats.admins, icon: ShieldCheck },
              { label: "ORGANIZERS", value: stats.organizers, icon: UserStar },
              { label: "PENDING ORGANIZER REQUESTS", value: stats.pendingRequests, icon: ClipboardList },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="h-[140px] sm:h-[170px] rounded-[18px] sm:rounded-[22px] border border-[#E8E1D5] bg-white p-3 sm:p-4 shadow-[0_10px_28px_rgba(24,48,40,.05)] flex flex-col justify-between min-w-0 w-full"
              >
                <div className="min-w-0 w-full">
                  <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#EFF2E9] shrink-0">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#183028] shrink-0" />
                  </div>
                  <p className="mt-3 truncate text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] sm:tracking-[0.22em] text-[#7C7C7C] uppercase">
                    {label}
                  </p>
                  <div className="mt-1 h-[2px] w-6 sm:w-8 rounded-full bg-[#C79A38]" />
                </div>
                <p className="font-serif font-bold text-2xl sm:text-[28px] leading-none text-[#183028] truncate">
                  {value}
                </p>
              </div>
            ))}
          </div>

        </div>
      </CardContent>
    </Card>
  );
}