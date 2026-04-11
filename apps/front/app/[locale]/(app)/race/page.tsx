"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ASSET_URLS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { useCreateRaceMutation, useGetRaceByCodeQuery, useJoinRaceMutation } from "@/redux/api/race"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const Page = () => {
  const t = useTranslations("racePage")

  const router = useRouter()
  const user = useAppSelector(selectUser)

  const [joinCode, setJoinCode] = useState("")
  const [joinCodeSearch, setJoinCodeSearch] = useState("")

  const [createRace, { isLoading: isCreating }] = useCreateRaceMutation()
  const [joinRace, { isLoading: isJoining }] = useJoinRaceMutation()

  const { data: raceByCode } = useGetRaceByCodeQuery(
    { code: joinCodeSearch.toUpperCase() },
    { skip: joinCodeSearch.length < 4 },
  )

  const handleCreate = async () => {
    if (!user) return
    const result = await createRace({ user })

    if (!result.data) {
      console.info("Failed to create race", result.error)

      return
    }

    router.push(PAGES.RACE_PLAY(result.data.id))
  }

  const handleJoin = async () => {
    if (!raceByCode || !user) return
    await joinRace({ raceId: raceByCode.id, user })
    router.push(PAGES.RACE_PLAY(raceByCode.id))
  }

  return (
    <main className="h-full-height flex flex-col items-center justify-center gap-12 p-6 bg-repeat bg-center bg-size-[25%]" style={{ backgroundImage: `url(${ASSET_URLS.CREATOR_BACKGROUND})` }}>
      <Image src={ASSET_URLS.BOTTOM_GB} alt="Gradient br" width={360} height={203} className="absolute bottom-0 right-0 z-0" />
      <h1 className="text-4xl font-bold bg-background px-4 py-2">Race Mode</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl bg-background px-4 py-2">
        {/* Create */}
        <section className="space-y-4 p-6 rounded-xl border">
          <h2 className="text-xl font-semibold">{t("createRace")}</h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
          <Button
            className="w-full"
            disabled={isCreating}
            onClick={handleCreate}
          >
            Create & go
          </Button>
        </section>

        {/* Join */}
        <section className="space-y-4 p-6 rounded-xl border">
          <h2 className="text-xl font-semibold">{t("joinRace")}</h2>
          <Input
            value={joinCode}
            onChange={(e) => {
              const v = e.target.value.toUpperCase()
              setJoinCode(v)
              if (v.length >= 4) setJoinCodeSearch(v)
            }}
            placeholder="Enter code (e.g. AB1C2D)"
            maxLength={6}
            className="font-mono uppercase"
          />
          {raceByCode && (
            <p className="text-sm text-muted-foreground">
              Found: race with {raceByCode.players.length} player{raceByCode.players.length !== 1 ? "s" : ""}
            </p>
          )}
          {joinCodeSearch.length >= 4 && !raceByCode && (
            <p className="text-sm text-destructive">No race found with this code.</p>
          )}
          <Button
            className="w-full"
            disabled={!raceByCode || isJoining}
            onClick={handleJoin}
          >
            Join
          </Button>
        </section>
      </div>
    </main>
  )
}

export default Page
