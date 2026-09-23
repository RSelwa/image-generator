import { useSyncExternalStore } from "react"
import {
  getItemFromLocalStorage,
  getItemFromSessionStorage,
  setItemInLocalStorage,
  setItemInSessionStorage,
} from "@/utils/storage"

export const subscribeToStorage = (callback: () => void) => {
  window.addEventListener("storage", callback)

  return () => {
    window.removeEventListener("storage", callback)
  }
}

export const useLocalStorage = <T>(
  key: string,
  defaultValue?: T,
): [T, (value: T) => void] => {
  const value = useSyncExternalStore(
    subscribeToStorage,
    () => getItemFromLocalStorage<T>(key),
    () => defaultValue || null,
  )

  const setValue = (value: T) => {
    setItemInLocalStorage<T>(key, value)
    window.dispatchEvent(new Event("storage"))
  }

  return [(value ?? defaultValue) as T, setValue]
}

export const useSessionStorage = <T>(
  key: string,
  defaultValue?: T,
): [T, (value: T) => void] => {
  const value = useSyncExternalStore(
    subscribeToStorage,
    () => getItemFromSessionStorage<T>(key),
    () => defaultValue || null,
  )

  const setValue = (value: T) => {
    setItemInSessionStorage<T>(key, value)
    window.dispatchEvent(new Event("storage"))
  }

  return [(value ?? defaultValue) as T, setValue]
}
