import { type ConstantValues, LOBBY_STATUS, SOCIALS_STATUS, SOUND_STATUS } from "@repo/common"
import { BADGE_VARIANTS } from "@/constants/mapping"

export const getBadgeVariantSocials = (status: ConstantValues<typeof SOCIALS_STATUS> | null) => {
  if (status === SOCIALS_STATUS.ERROR) return BADGE_VARIANTS.RED

  if (status === SOCIALS_STATUS.DRAFT) return BADGE_VARIANTS.NEUTRAL

  if (status === SOCIALS_STATUS.IN_PROGRESS_AUDIO_EXTRACTION ||
    status === SOCIALS_STATUS.IN_PROGRESS_CAPTURE ||
    status === SOCIALS_STATUS.IN_PROGRESS_CUSTOMIZATION ||
    status === SOCIALS_STATUS.WAITING_FOR_POST
  ) return BADGE_VARIANTS.ORANGE

  if (status === SOCIALS_STATUS.READY_TO_POST) return BADGE_VARIANTS.BLUE

  if (status === SOCIALS_STATUS.UPLOADED) return BADGE_VARIANTS.GREEN

  return BADGE_VARIANTS.NEUTRAL
}

export const getBadgeVariantSounds = (status: ConstantValues<typeof SOUND_STATUS> | null) => {
  if (status === SOUND_STATUS.DRAFT) return BADGE_VARIANTS.NEUTRAL
  if (status === SOUND_STATUS.ERROR) return BADGE_VARIANTS.RED
  if (status === SOUND_STATUS.PROCESSED) return BADGE_VARIANTS.GREEN
  if (status === SOUND_STATUS.PENDING) return BADGE_VARIANTS.ORANGE

  return BADGE_VARIANTS.NEUTRAL
}

export const getBadgeTextSounds = (status: ConstantValues<typeof SOUND_STATUS> | null) => {
  if (status === SOUND_STATUS.DRAFT) return "Draft"
  if (status === SOUND_STATUS.WAITING_FOR_EXTRACTION) return "Waiting for extraction"
  if (status === SOUND_STATUS.PENDING) return "Pending"
  if (status === SOUND_STATUS.PROCESSED) return "Processed"
  if (status === SOUND_STATUS.ERROR) return "Error"

  return status
}

export const getBadgeVariantBoolean = (value: boolean) => value ? BADGE_VARIANTS.GREEN : BADGE_VARIANTS.RED

export const getBadgeTextBoolean = (value: boolean) => value ? "True" : "False"

const DAY_VARIANTS = [
  BADGE_VARIANTS.PINK, // Sunday
  BADGE_VARIANTS.BLUE, // Monday
  BADGE_VARIANTS.GREEN, // Tuesday
  BADGE_VARIANTS.YELLOW, // Wednesday
  BADGE_VARIANTS.ORANGE, // Thursday
  BADGE_VARIANTS.LIME, // Friday
  BADGE_VARIANTS.PURPLE, // Saturday
] as const

export const getBadgeVariantByDate = (date: Date | null | undefined) => {
  if (!date) return BADGE_VARIANTS.NEUTRAL

  return DAY_VARIANTS[date.getDay()]
}

export const getBadgeVariantLobbyStatus = (status: ConstantValues<typeof LOBBY_STATUS>) => {
  if (status === LOBBY_STATUS.WAITING) return BADGE_VARIANTS.BLUE
  if (status === LOBBY_STATUS.STARTING) return BADGE_VARIANTS.ORANGE
  if (status === LOBBY_STATUS.PLAYING) return BADGE_VARIANTS.GREEN
  if (status === LOBBY_STATUS.FINISHED) return BADGE_VARIANTS.PINK
  if (status === LOBBY_STATUS.ABANDONED) return BADGE_VARIANTS.RED

  return BADGE_VARIANTS.NEUTRAL
}
