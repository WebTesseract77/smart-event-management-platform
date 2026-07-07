import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const skeletonVariants = cva(
  "animate-pulse bg-gradient-to-r from-[#F5F2EA] via-[#E8E1D5]/40 to-[#F5F2EA] opacity-90",
  {
    variants: {
      size: {
        default: "h-4 w-full",
        sm: "h-3 w-full",
        lg: "h-6 w-full",
        card: "h-10 w-full",
      },
      radius: {
        default: "rounded-2xl",
        sm: "rounded-xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      size: "default",
      radius: "default",
    },
  }
);

function Skeleton({
  className,
  size,
  radius,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof skeletonVariants>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ size, radius, className }))}
      {...props}
    />
  );
}

export { Skeleton, skeletonVariants };
