import { useSearchParams } from "next/navigation"

// Helper to get current search params from URL (not stale React state)
const getCurrentSearchParams = () =>
  new URLSearchParams(window.location.search)

export function useModal(key: string, value?: string) {
  const searchParams = useSearchParams()

  const openModal = (overrideValue?: string) => {
    const query = getCurrentSearchParams()
    query.set(key, overrideValue ?? value ?? "")

    window.history.replaceState(null, "", `?${query.toString()}`)
  }

  const closeModal = () => {
    const query = getCurrentSearchParams()
    query.delete(key)

    window.history.replaceState(null, "", `?${query.toString()}`)
  }

  return {
    openModal,
    closeModal,
    value: searchParams.get(key),
    isOpened: searchParams.has(key),
  }
}
