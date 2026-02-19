import { getItemFromLocalStorage, setItemInLocalStorage } from "@/utils/storage"
import { useSyncExternalStore } from "react"

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback)

  return () => {
    window.removeEventListener("storage", callback)
  }
}

export const useLocalStorage = <T>(
  key: string,
  defaultValue?: T
): [T, (value: T) => void] => {
  const value = useSyncExternalStore(subscribe, () =>
    getItemFromLocalStorage<T>(key))

  const setValue = (value: T) => {
    setItemInLocalStorage<T>(key, value)
    window.dispatchEvent(new Event("storage"))
  }

  return [(value ?? defaultValue) as T, setValue]
}
