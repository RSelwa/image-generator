import { type AVATARS_KEYS, type ConstantValues } from "@repo/common"
import { type DonorTier } from "@repo/schemas"
import { type ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { firstLetter } from "@/utils"
import { getAvatarUrl } from "@/utils/file"

type UserAvatarProps = {
  avatar?: ConstantValues<typeof AVATARS_KEYS> | string
  name: string
  donorTier?: DonorTier
  size?: "sm" | "default" | "lg"
  className?: string
  fallbackClassName?: string
  imageClassName?: string
  imageData?: Record<string, unknown>
  action?: ReactNode
}

export const UserAvatar = ({
  avatar,
  name,
  donorTier,
  size = "default",
  className,
  fallbackClassName,
  imageClassName,
  imageData,
  action,
}: UserAvatarProps) => (
  <Avatar size={size} className={className}>
    {avatar && <AvatarImage donorTier={donorTier} src={getAvatarUrl(avatar as ConstantValues<typeof AVATARS_KEYS>)} alt={name} className={imageClassName} {...imageData} />}
    <AvatarFallback className={fallbackClassName}>{firstLetter(name)}</AvatarFallback>
    {action}
  </Avatar>
)
