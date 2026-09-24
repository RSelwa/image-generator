import { FEATURE_FLAGS, type FeatureFlag } from "@/constants/feature-flags"
import { QUERY_PARAMS } from "@/constants/mapping"

const FEATURE_FLAG_SEPARATOR = "-"
const FEATURE_FLAG_ENABLED = "true"

const isFeatureFlag = (name: string): name is FeatureFlag =>
  Object.values<string>(FEATURE_FLAGS).includes(name)

export const isFeatureFlagEnabled = (storedValue: unknown) =>
  storedValue === true

export const parseFeatureFlagParam = (param: string | null) => {
  if (!param) return null

  const [name, status] = param.split(FEATURE_FLAG_SEPARATOR)
  if (!isFeatureFlag(name)) return null

  return { flag: name, isEnabled: status === FEATURE_FLAG_ENABLED }
}

export const getFeatureFlagUrl = (href: string, flag: FeatureFlag) => {
  const url = new URL(href)
  url.searchParams.set(
    QUERY_PARAMS.FEATURE_FLAG,
    `${flag}${FEATURE_FLAG_SEPARATOR}${FEATURE_FLAG_ENABLED}`,
  )

  return url.toString()
}
