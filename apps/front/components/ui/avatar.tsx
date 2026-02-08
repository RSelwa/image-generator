"use client"

import type * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/utils"

const Avatar = ({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "default" | "sm" | "lg"
}) => (
  <AvatarPrimitive.Root
    data-slot="avatar"
    data-size={size}
    className={cn(
      "group/avatar relative flex size-8 shrink-0 rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6",
      className,
    )}
    {...props}
  />
)

const AvatarImage = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) => (
  <AvatarPrimitive.Image
    data-slot="avatar-image"
    className={cn("aspect-square size-full rounded-full overflow-hidden object-cover", className)}
    {...props}
  />
)

const AvatarFallback = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) => (
  <AvatarPrimitive.Fallback
    data-slot="avatar-fallback"
    className={cn(
      "bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full text-sm group-data-[size=sm]/avatar:text-xs",
      className,
    )}
    {...props}
  />
)

const AvatarBadge = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    data-slot="avatar-badge"
    className={cn(
      "bg-primary text-primary-foreground ring-background absolute left-0 top-0 z-10 inline-flex items-center justify-center rounded-full ring-2 select-none",
      "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
      "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
      "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
      className,
    )}
    {...props}
  />
)

const AvatarGroup = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="avatar-group"
    className={cn(
      "*:data-[slot=avatar]:ring-background group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2",
      className,
    )}
    {...props}
  />
)

const AvatarGroupCount = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="avatar-group-count"
    className={cn(
      "bg-muted text-muted-foreground ring-background relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm ring-2 group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
      className,
    )}
    {...props}
  />
)

export {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
}
