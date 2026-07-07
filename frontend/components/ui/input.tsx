import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-[44px] w-full min-w-0 rounded-[14px] border border-[#D9D3C1] bg-white px-3.5 text-[0.96rem] text-[#183028] transition-all duration-200 ease-out outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#8A918B] focus-visible:border-[#0F4D3F] focus-visible:ring-2 focus-visible:ring-[#0F4D3F]/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#F5F2EA] disabled:opacity-70 aria-invalid:border-[#DC4B3E] aria-invalid:ring-2 aria-invalid:ring-[#DC4B3E]/15",
        className
      )}
      {...props}
    />
  )
}

export { Input }
