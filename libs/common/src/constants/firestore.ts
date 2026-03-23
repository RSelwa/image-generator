export const USERS_FIELDS = {
  IS_ANONYMOUS_USER: "isAnonymousUser",
} as const

export const DONOR_TIERS = {
  BRONZE: "bronze",
  SILVER: "silver",
  GOLD: "gold",
} as const

export const DONOR_TIER_THRESHOLDS = {
  [DONOR_TIERS.BRONZE]: 1,
  [DONOR_TIERS.SILVER]: 3,
  [DONOR_TIERS.GOLD]: 5,
} as const

export const COUPON_EXPIRY_DAYS = 30
