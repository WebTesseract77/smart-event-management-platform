import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
}

export default function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  return (
    <Card
      className="
        group

        min-h-[120px]
        sm:min-h-[150px]

        rounded-[22px]
        sm:rounded-[24px]

        border
        border-[#E8E1D5]

        bg-white

        shadow-[0_12px_32px_rgba(15,77,63,0.05)]

        transition-all
        duration-300

        hover:-translate-y-0.5
      "
    >
      <CardContent
        className="
          flex
          h-full
          flex-col
          justify-between

          p-4
          sm:p-5
        "
      >
        <div className="flex items-start justify-between gap-2">

          <div className="min-w-0">

            <p
              className="
                truncate

                text-[0.65rem]
                sm:text-[0.72rem]

                font-semibold
                uppercase

                tracking-[0.12em]
                sm:tracking-[0.2em]

                text-[#5E665F]
              "
            >
              {title}
            </p>


            <h2
              className="
                mt-3

                text-[1.8rem]
                sm:text-[2.1rem]

                font-semibold

                leading-tight

                tracking-[-0.03em]

                text-[#183028]
              "
            >
              {value}
            </h2>

          </div>


          {icon && (
            <div
              className="
                flex

                h-10
                w-10

                sm:h-12
                sm:w-12

                shrink-0

                items-center
                justify-center

                rounded-[16px]
                sm:rounded-[18px]

                border
                border-[#E8E1D5]

                bg-[#F5F2EA]

                text-[#0F4D3F]

                transition-all
                duration-300

                group-hover:scale-105
              "
            >
              {icon}
            </div>
          )}

        </div>


        <div
          className="
            mt-4

            hidden
            sm:flex

            items-center
            justify-between

            text-[0.82rem]

            text-[#5E665F]
          "
        >

          <span>
            Live dashboard metric
          </span>


          <span
            className="
              inline-flex
              items-center
              gap-1

              font-semibold

              text-[#0F4D3F]
            "
          >
            <ArrowUpRight className="h-4 w-4 text-[#C6922F]" />

            Trend

          </span>

        </div>

      </CardContent>
    </Card>
  );
}