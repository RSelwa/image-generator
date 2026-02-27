import { DEFAULT_SOCIAL_HOOK, SOCIALS_HOOKS } from "./../constants/socials"

export const extractYoutubeId = (url: string): string | null => {
  const patterns = [
    /(?:v=|\/v\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }

  return null
}

export const getRandomHook = () => {
  const hookValues = Object.values(SOCIALS_HOOKS)

  const hook = hookValues[Math.floor(Math.random() * hookValues.length)]

  if (!hook) return DEFAULT_SOCIAL_HOOK

  return hook
}
