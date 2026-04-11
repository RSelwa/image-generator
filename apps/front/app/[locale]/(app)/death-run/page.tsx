"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PAGES } from "@/constants/pages"
import { useCreateDeathRunMutation, useGetDeathRunByCodeQuery, useJoinDeathRunMutation } from "@/redux/api/death-run"
import { selectUser } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const Page = () => {
  const t = useTranslations("deathRunPage")

  const router = useRouter()
  const user = useAppSelector(selectUser)

  const [joinCode, setJoinCode] = useState("")
  const [joinCodeSearch, setJoinCodeSearch] = useState("")

  const [createDeathRun, { isLoading: isCreating }] = useCreateDeathRunMutation()
  const [joinDeathRun, { isLoading: isJoining }] = useJoinDeathRunMutation()

  const { data: deathRunByCode } = useGetDeathRunByCodeQuery(
    { code: joinCodeSearch.toUpperCase() },
    { skip: joinCodeSearch.length < 4 },
  )

  const handleCreate = async () => {
    if (!user) return
    const result = await createDeathRun({ user })

    if (!result.data) {
      console.info("Failed to create death run", result.error)

      return
    }

    router.push(PAGES.DEATH_RUN_PLAY(result.data.id))
  }

  const handleJoin = async () => {
    if (!deathRunByCode || !user) return
    await joinDeathRun({ deathRunId: deathRunByCode.id, user })
    router.push(PAGES.DEATH_RUN_PLAY(deathRunByCode.id))
  }

  return (
    <main className="h-full-height flex flex-col items-center justify-center gap-12 p-6">
      <h1 className="text-4xl font-bold">Death Run</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <section className="space-y-4 p-6 rounded-xl border">
          <h2 className="text-xl font-semibold">{t("createDeathRun")}</h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
          <Button
            className="w-full"
            disabled={isCreating}
            onClick={handleCreate}
          >
            Create & go
          </Button>
        </section>

        <section className="space-y-4 p-6 rounded-xl border">
          <h2 className="text-xl font-semibold">{t("joinDeathRun")}</h2>
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
          {deathRunByCode && (
            <p className="text-sm text-muted-foreground">
              Found: death run with {deathRunByCode.players.length} player{deathRunByCode.players.length !== 1 ? "s" : ""}
            </p>
          )}
          {joinCodeSearch.length >= 4 && !deathRunByCode && (
            <p className="text-sm text-destructive">No death run found with this code.</p>
          )}
          <Button
            className="w-full"
            disabled={!deathRunByCode || isJoining}
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
