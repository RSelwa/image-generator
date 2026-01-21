import { FLIM_API_BASE } from "~/constants"
import list from "./username-possibilities.json" with { type: "json" }

const generateUsername = () => {
  const { adjectives, animals, colors } = list

  const color = colors[Math.floor(Math.random() * colors.length)] ?? ""
  const adjective =
    adjectives[Math.floor(Math.random() * adjectives.length)] ?? ""
  const animal = animals[Math.floor(Math.random() * animals.length)] ?? ""

  return `${adjective}${color}${animal}`.toLowerCase()
}

const checkIfUsernameAvailable = async (value: string) => {
  try {
    const res = await fetch(
      `${FLIM_API_BASE}/user/verify-username?value=${value}`,
    )
    if (!res.ok) return false

    const data = (await res.json()) as { available: boolean }

    return data.available
  } catch (error) {
    console.error("Error checking username availability:", error)

    return false
  }
}

export const generateAvailableUsername = async () => {
  let username = generateUsername()

  while (!(await checkIfUsernameAvailable(username))) {
    username = generateUsername()
  }

  return username
}
