import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-7 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 text-[0.78rem] font-semibold uppercase tracking-[0.01em] whitespace-nowrap transition-all duration-200 ease-out focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[#0F4D3F] text-white shadow-sm [a]:hover:bg-[#0B3E33]",
        secondary:
          "bg-[#F5F2EA] text-[#183028] shadow-sm [a]:hover:bg-[#EFE8D8]",
        destructive:
          "bg-[#F8E6E3] text-[#DC4B3E] focus-visible:ring-[#DC4B3E]/20 [a]:hover:bg-[#F5D8D3]",
        outline:
          "border-[#D9D3C1] bg-white text-[#183028] shadow-sm [a]:hover:bg-[#F5F2EA]",
        ghost: "hover:bg-[#F5F2EA] hover:text-[#183028]",
        link: "text-[#0F4D3F] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
