import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import * as React from "react"
import { cn } from "@/utils"

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        marathon: "text-primary-foreground bg-primary hover:text-primary hover:bg-background inset-shadow-marathon rounded-none font-interference uppercase transition-none",
        "marathon-white": "text-primary-foreground uppercase bg-foreground hover:text-primary hover:bg-background inset-shadow-marathon-white hover:inset-shadow-marathon rounded-none font-interference transition-none",
        "marathon-black": "text-foreground uppercase bg-background hover:text-primary hover:bg-background inset-shadow-marathon-white hover:inset-shadow-marathon rounded-none font-interference transition-none",
        "marathon-destructive": "text-foreground bg-destructive uppercase hover:text-foreground hover:bg-destructive/90 rounded-none border-none font-interference",
        "marathon-outline": "text-foreground bg-background uppercase hover:text-primary hover:bg-background inset-shadow-marathon-white hover:inset-shadow-marathon rounded-none font-interference transition-none",
        "marathon-link": "text-foreground bg-transparent uppercase hover:text-primary hover:bg-primary hover:text-primary-foreground rounded-none font-mono transition-none",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        xl: "h-12 px-12 has-[>svg]:px-8",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
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
  variant = "marathon",
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
      type="button"
      {...props}
    />
  )
}

export { Button, buttonVariants }
