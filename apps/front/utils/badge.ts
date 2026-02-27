import { type ConstantValues, SOUND_STATUS } from "@repo/common"
import { BADGE_VARIANTS } from "@/constants/mapping"

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
