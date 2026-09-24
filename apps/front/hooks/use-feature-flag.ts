import { useSyncExternalStore } from "react"
import { type FeatureFlag } from "@/constants/feature-flags"
import { subscribeToStorage } from "@/hooks/use-storage"
import { isFeatureFlagEnabled } from "@/utils/feature-flags"
import { getItemFromLocalStorage } from "@/utils/storage"

export const useFeatureFlag = (flag: FeatureFlag) =>
  useSyncExternalStore<boolean | null>(
    subscribeToStorage,
    () => isFeatureFlagEnabled(getItemFromLocalStorage<unknown>(flag)),
    () => null,
  )
