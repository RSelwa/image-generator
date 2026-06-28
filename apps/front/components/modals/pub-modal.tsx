"use client"

import { DonationPub } from "@/components/modals/donation-pub"
import { RaceModePub } from "@/components/modals/race-mode-pub"
import { LIMITED_MODAL_CONFIG, LIMITED_MODAL_KEYS } from "@/constants/mapping"
import { useLocalStorage } from "@/hooks/use-storage"

const PubModal = () => {
  const [raceCount] = useLocalStorage<number>(LIMITED_MODAL_KEYS.RACE_MODE, 0)
  const raceDone = raceCount >= LIMITED_MODAL_CONFIG[LIMITED_MODAL_KEYS.RACE_MODE].maxCount

  return (
    <>
      {!raceDone && <RaceModePub />}
      {raceDone && <DonationPub />}
    </>
  )
}

export default PubModal
