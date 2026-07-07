import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-[0.95rem] font-medium whitespace-nowrap transition-all duration-200 ease-out outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 active:not-aria-[haspopup]:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#0F4D3F] text-white hover:bg-[#0D4530] shadow-sm",
        outline:
          "border-[#D9D3C1] bg-white text-[#183028] hover:bg-[#F5F2EA] aria-expanded:bg-[#F5F2EA] aria-expanded:text-[#183028]",
        secondary:
          "bg-[#F5F2EA] text-[#183028] hover:bg-[#EFE8D8] aria-expanded:bg-[#F5F2EA] aria-expanded:text-[#183028]",
        ghost:
          "bg-transparent hover:bg-[#F5F2EA] hover:text-[#183028] aria-expanded:bg-[#F5F2EA] aria-expanded:text-[#183028]",
        destructive:
          "bg-[#F8E6E3] text-[#DC4B3E] hover:bg-[#F5D8D3] focus-visible:border-[#DC4B3E]/40 focus-visible:ring-[#DC4B3E]/20",
        link: "text-[#0F4D3F] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 gap-2 px-5 rounded-full has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        xs:
          "h-7 gap-1 rounded-full px-2.5 text-[0.76rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm:
          "h-9 gap-1.5 rounded-full px-3.5 text-[0.88rem] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-3.5",
        lg:
          "h-11 gap-2 px-5 rounded-full has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-10 rounded-full",
        "icon-xs":
          "size-8 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-10 rounded-full",
        "icon-lg": "size-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
