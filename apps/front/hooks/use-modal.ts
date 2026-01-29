import { useSearchParams } from "next/navigation"

export const useModal = (key: string, value?: string) => {
  const searchParams = useSearchParams()

  const openModal = () => {
    const query = new URLSearchParams(searchParams)
    query.set(key, value ?? "")

    window.history.replaceState(null, "", `?${query.toString()}`)
  }

  const closeModal = () => {
    const query = new URLSearchParams(searchParams)
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
