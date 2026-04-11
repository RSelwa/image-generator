"use client"

import { type RaceDocWithId } from "@repo/schemas"
import { Users } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"
import { ASSET_URLS } from "@/constants/mapping"
import { usePrepareAndStartRaceMutation } from "@/redux/api/race"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const RaceWaiting = ({ race }: { race: RaceDocWithId }) => {
  const uid = useAppSelector(selectUserId)
  const [prepareAndStartRace, { isLoading }] = usePrepareAndStartRaceMutation()
  const isHost = race.hostId === uid

  return (
    <div className="relative h-full-height flex flex-col items-center justify-center gap-8 p-6 bg-repeat bg-center bg-size-[25%]" style={{ backgroundImage: `url(${ASSET_URLS.CREATOR_BACKGROUND})` }}>
      <Image src={ASSET_URLS.BOTTOM_GB} alt="Gradient br" width={360} height={203} className="absolute bottom-0 right-0 z-0" />
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Race Lobby</h1>
        <p className="text-muted-foreground">
          Share code <span className="font-mono font-bold text-foreground text-xl">{race.code}</span> to invite friends
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Users className="size-4" />
          <span>{race.players.length} player{race.players.length !== 1 ? "s" : ""}</span>
        </div>
        {race.players.map((player) => (
          <div key={player.uid} className="flex items-center gap-3 p-3 rounded-lg border">
            <UserAvatar {...player} name={player.name || "?"} className="size-8" />
            <span className="font-medium">{player.name}</span>
            {player.uid === race.hostId && (
              <span className="ml-auto text-xs text-muted-foreground">host</span>
            )}
          </div>
        ))}
      </div>

      {isHost && (
        <Button size="lg" onClick={() => prepareAndStartRace({ raceId: race.id, playersIds: race.playersIds })} disabled={isLoading}>
          Start Race
        </Button>
      )}
      {!isHost && (
        <p className="text-muted-foreground text-sm">Waiting for the host to start…</p>
      )}
    </div>
  )
}

export default RaceWaiting
