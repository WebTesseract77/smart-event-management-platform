import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-[140px] w-full rounded-[14px] border border-[#D9D3C1] bg-white px-3.5 py-3 text-[0.96rem] text-[#183028] transition-all duration-200 ease-out outline-none placeholder:text-[#8A918B] focus-visible:border-[#0F4D3F] focus-visible:ring-2 focus-visible:ring-[#0F4D3F]/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#F5F2EA] disabled:opacity-70 aria-invalid:border-[#DC4B3E] aria-invalid:ring-2 aria-invalid:ring-[#DC4B3E]/15",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
