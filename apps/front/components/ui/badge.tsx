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
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        blur: "border-border bg-transparent backdrop-blur-sm text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        [BADGE_VARIANTS.GREEN]:
          "border-success/20 bg-success/10 text-success-foreground",
        [BADGE_VARIANTS.BLUE]: "border-info/20 bg-info/10 text-info-foreground",
        [BADGE_VARIANTS.RED]:
          "border-destructive/20 bg-destructive/10 text-destructive-foreground",
        "light-grey":
          "border-border bg-transparent backdrop-blur-sm text-muted-foreground",
        [BADGE_VARIANTS.NEUTRAL]: "border-border bg-muted text-muted-foreground",
        [BADGE_VARIANTS.ORANGE]:
          "border-warning/20 bg-warning/10 text-warning-foreground",
        [BADGE_VARIANTS.PURPLE]:
          "border-purple-500/20 bg-purple-500/10 text-purple-400",
        [BADGE_VARIANTS.YELLOW]:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
        [BADGE_VARIANTS.PINK]:
          "border-marathon-pink/20 bg-marathon-pink/10 text-marathon-pink",
        [BADGE_VARIANTS.LIME]:
          "border-lime-500/20 bg-lime-500/10 text-lime-400",
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
