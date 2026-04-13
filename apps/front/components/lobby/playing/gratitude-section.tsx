"use client"

import { type PublicPlayer } from "@repo/schemas"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useGetGratitudePlayersQuery } from "@/redux/api/gratitude"
import { isTextGlow } from "@/utils/user"

const GratitudePlayer = ({ player }: { player: PublicPlayer }) => (
  <div className="flex items-center gap-3">
    <UserAvatar
      avatar={player.avatar || undefined}
      name={player.pseudo || player.id}
      donorTier={player.donorTier}
      size="sm"
    />
    <span data-text-glow={isTextGlow(player.donorTier)} className="flex-1 truncate font-shapiro-wide text-sm">{player.pseudo || "—"}</span>
  </div>
)

type GratitudeSectionProps = {
  gameId: string
  sphericalId?: string | null
  flatId?: string | null
  mapId?: string | null
}

const GratitudeSection = ({ gameId, sphericalId, flatId, mapId }: GratitudeSectionProps) => {
  const { data: players } = useGetGratitudePlayersQuery(
    { gameId, sphericalId, flatId, mapId },
    { skip: !gameId },
  )

  if (!players?.length) return null

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-interference">Thanks to</span>
      {players.map((player) => (
        <GratitudePlayer key={player.id} player={player} />
      ))}
    </div>
  )
}

export default GratitudeSection
