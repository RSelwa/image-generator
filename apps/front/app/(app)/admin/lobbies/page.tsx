"use client"

import { LOBBY_STATUS } from "@repo/common"
import Link from "next/link"
import AdminHeader from "@/components/admin-header"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BADGE_VARIANTS } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { useGetOngoingLobbiesQuery } from "@/redux/api/lobby"

const STATUS_TO_VARIANT = {
  [LOBBY_STATUS.WAITING]: BADGE_VARIANTS.BLUE,
  [LOBBY_STATUS.STARTING]: BADGE_VARIANTS.ORANGE,
  [LOBBY_STATUS.PLAYING]: BADGE_VARIANTS.GREEN,
  [LOBBY_STATUS.FINISHED]: BADGE_VARIANTS.NEUTRAL,
} as const

const formatDate = (timestamp: unknown) => {
  if (!timestamp) return "-"
  const date = (timestamp as { toDate: () => Date }).toDate()

  return date.toLocaleString()
}

const Page = () => {
  const { data, isLoading, refetch } = useGetOngoingLobbiesQuery()

  const lobbies = data || []

  return (
    <main className="p-2 min-h-full-height-admin">
      <AdminHeader title="Lobbies" numberOfElements={lobbies.length}>
        <button
          onClick={() => refetch()}
          className="text-sm underline text-neutral-400 hover:text-white transition-colors"
        >
          Refresh
        </button>
      </AdminHeader>

      {isLoading && <p>Loading...</p>}

      {!isLoading && lobbies.length === 0 && (
        <p className="text-neutral-400 text-center mt-12">No ongoing lobbies</p>
      )}

      {lobbies.length > 0 && (
        <Table noWrapper={false}>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Round</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Lives</TableHead>
              <TableHead>Demo</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lobbies.map((lobby) => (
              <TableRow key={lobby.id}>
                <TableCell className="font-mono font-bold">{lobby.code}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_TO_VARIANT[lobby.status]}>
                    {lobby.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {lobby.players.length} / {lobby.config.maxPlayers}
                </TableCell>
                <TableCell>
                  {lobby.currentRound} / {lobby.config.numberOfRounds}
                </TableCell>
                <TableCell>{lobby.config.roundDuration}s</TableCell>
                <TableCell>{lobby.config.playersLives || "Unlimited"}</TableCell>
                <TableCell>
                  {lobby.isDemo && <Badge variant={BADGE_VARIANTS.PURPLE}>Demo</Badge>}
                  {!lobby.isDemo && <span className="text-neutral-500">-</span>}
                </TableCell>
                <TableCell className="text-neutral-400">{formatDate(lobby.createdAt)}</TableCell>
                <TableCell>
                  <Link
                    href={`${PAGES.ADMIN_LOBBIES}/${lobby.id}`}
                    className="text-sm underline hover:text-white transition-colors"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </main>
  )
}

export default Page
