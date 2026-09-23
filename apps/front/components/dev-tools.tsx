"use client"

import { FlagIcon, Link2Icon } from "lucide-react"
import { useQueryState } from "nuqs"
import { useEffect } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DEV_TOOLS_HOTKEY, DEV_TOOLS_STORAGE_KEY } from "@/constants/dev-tools"
import { IS_PROD } from "@/constants/env"
import { FEATURE_FLAGS, type FeatureFlag } from "@/constants/feature-flags"
import { QUERY_PARAMS } from "@/constants/mapping"
import { useLocalStorage } from "@/hooks/use-storage"
import { selectIsAdmin } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getFeatureFlagUrl, parseFeatureFlagParam } from "@/utils/feature-flags"
import { setItemInLocalStorage } from "@/utils/storage"

const FeatureFlagItem = ({ flag }: { flag: FeatureFlag }) => {
  const [isEnabled, setIsEnabled] = useLocalStorage(flag, false)

  const copyLink = async (event: React.MouseEvent) => {
    event.stopPropagation()
    await navigator.clipboard.writeText(
      getFeatureFlagUrl(window.location.href, flag),
    )
    toast.success("Feature flag link copied")
  }

  return (
    <DropdownMenuCheckboxItem
      checked={isEnabled}
      onCheckedChange={setIsEnabled}
      onSelect={(event) => event.preventDefault()}
    >
      {flag}
      <button
        aria-label="Copy feature flag link"
        className="ml-auto cursor-pointer"
        onClick={copyLink}
      >
        <Link2Icon className="size-3.5" />
      </button>
    </DropdownMenuCheckboxItem>
  )
}

export const DevTools = () => {
  const isAdmin = useAppSelector(selectIsAdmin)
  const [isDisplayed, setIsDisplayed] = useLocalStorage(
    DEV_TOOLS_STORAGE_KEY,
    false,
  )
  const [featureFlagParam, setFeatureFlagParam] = useQueryState(
    QUERY_PARAMS.FEATURE_FLAG,
  )

  const canUseDevTools = !IS_PROD || isAdmin

  useEffect(() => {
    const featureFlag = parseFeatureFlagParam(featureFlagParam)
    if (!featureFlag) return

    setItemInLocalStorage(featureFlag.flag, featureFlag.isEnabled)
    window.dispatchEvent(new Event("storage"))
    void setFeatureFlagParam(null)
  }, [featureFlagParam])

  useHotkeys(
    DEV_TOOLS_HOTKEY,
    () => setIsDisplayed(!isDisplayed),
    { enabled: canUseDevTools, preventDefault: true },
    [isDisplayed],
  )

  const isVisible = isDisplayed && canUseDevTools
  if (!isVisible) return null

  return (
    <aside
      data-cy="dev-tools-bar"
      className="fixed bottom-2 left-1/2 z-999 flex -translate-x-1/2 gap-1 rounded-full border bg-background p-1 shadow-md"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="xs" className="rounded-full">
            <FlagIcon />
            Feature flags
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel>Feature flags</DropdownMenuLabel>
          {Object.values<FeatureFlag>(FEATURE_FLAGS).map((flag) => (
            <FeatureFlagItem key={flag} flag={flag} />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  )
}
