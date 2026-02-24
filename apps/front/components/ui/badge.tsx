import type * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { BADGE_VARIANTS } from "@/constants/mapping"
import { cn } from "@/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-foreground [a&]:hover:bg-primary/90",
        blur: "border-grey-100 bg-transparent backdrop-blur-sm text-white",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        [BADGE_VARIANTS.GREEN]: "border-green-600 bg-green-400/50 text-green-200",
        [BADGE_VARIANTS.BLUE]: "border-blue-accent bg-blue-accent/50 text-blue-100",
        [BADGE_VARIANTS.RED]: "border-red-600 bg-red-300/80 text-red-200 backdrop-blur-sm",
        "light-grey": "border-neutral-100 bg-transparent backdrop-blur-sm text-neutral-200",
        [BADGE_VARIANTS.NEUTRAL]: "border-neutral-500 bg-neutral-900/90 text-white",
        [BADGE_VARIANTS.ORANGE]:
          "border-orange-600 bg-orange-400/50 text-orange-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const Badge = ({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot : "span"

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
