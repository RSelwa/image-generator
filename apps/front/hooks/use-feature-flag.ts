import { useSyncExternalStore } from "react"
import { type FeatureFlag } from "@/constants/feature-flags"
import { subscribeToStorage } from "@/hooks/use-storage"
import { getItemFromLocalStorage } from "@/utils/storage"

export const useFeatureFlag = (flag: FeatureFlag) =>
  useSyncExternalStore<boolean | null>(
    subscribeToStorage,
    () => getItemFromLocalStorage<unknown>(flag) === true,
    () => null,
  )
