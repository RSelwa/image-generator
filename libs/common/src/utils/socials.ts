import { DEFAULT_SOCIAL_HOOK, SOCIALS_HOOKS } from "./../constants/socials"

export const getRandomHook = () => {
  const hookValues = Object.values(SOCIALS_HOOKS)

  const hook = hookValues[Math.floor(Math.random() * hookValues.length)]

  if (!hook) return DEFAULT_SOCIAL_HOOK

  return hook
}
