export const FEATURE_FLAGS = {
  CREDITS: "credits",
  ACHIEVEMENTS: "achievements",
} as const

export type FeatureFlag = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS]
