"use client"

import { LOBBY_STATUS } from "@repo/common"
import { type PlayerAnswer, type RoundAnswerDocWithId } from "@repo/schemas"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
import { useSubscribeAllRoundAnswersQuery, useSubscribeLobbyQuery } from "@/redux/api/lobby"
import { getBadgeVariantLobbyStatus } from "@/utils/badge"

const getLobbyIdFromPathname = (pathname: string) => {
  const match = pathname.match(/\/admin\/lobbies\/([^/]+)/)

  return match ? match[1] : ""
}

const formatTimestamp = (timestamp: unknown) => {
  if (!timestamp) return "-"
  const date = (timestamp as { toDate: () => Date }).toDate()

  return date.toLocaleString()
}

const AnswerCell = ({ answer }: { answer: PlayerAnswer }) => {
  if (answer.isCorrect) {
    return (
      <div className="flex flex-col gap-1">
        <Badge variant={BADGE_VARIANTS.GREEN}>Correct</Badge>
        <span className="text-xs text-neutral-400">{answer.answer || `Option ${answer.selectedOptionIndex}`}</span>
        <span className="text-xs text-neutral-500">{answer.points} pts ({answer.gamePoints} game + {answer.distancePoints} dist)</span>
      </div>
    )
  }

  if (answer.answer || answer.selectedOptionIndex !== null) {
    return (
      <div className="flex flex-col gap-1">
        <Badge variant={BADGE_VARIANTS.RED}>Wrong</Badge>
        <span className="text-xs text-neutral-400">{answer.answer || `Option ${answer.selectedOptionIndex}`}</span>
        <span className="text-xs text-neutral-500">{answer.points} pts</span>
      </div>
    )
  }

  if (answer.submittedAt) {
    return <Badge variant={BADGE_VARIANTS.NEUTRAL}>No answer</Badge>
  }

  return <span className="text-neutral-600">Pending</span>
}

const RoundSection = ({ round, isCurrent }: { round: RoundAnswerDocWithId, isCurrent: boolean }) => (
  <section className="mb-6">
    <div className="flex items-center gap-3 mb-2">
      <h3 className="text-lg font-semibold">Round {round.roundIndex}</h3>
      {round.isSpecial && <Badge variant={BADGE_VARIANTS.PURPLE}>Special</Badge>}
      {isCurrent && <Badge variant={BADGE_VARIANTS.ORANGE}>Current</Badge>}
      {round.isComplete && <Badge variant={BADGE_VARIANTS.GREEN}>Complete</Badge>}
      {round.type && <Badge variant={BADGE_VARIANTS.NEUTRAL}>{round.type}</Badge>}
      {round.gameTitle && <span className="text-sm text-neutral-400">{round.gameTitle}</span>}
    </div>

    <Table noWrapper={false}>
      <TableHeader>
        <TableRow>
          <TableHead>Player</TableHead>
          <TableHead>Answer</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Lives Used</TableHead>
          <TableHead>Ready</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {round.answers.map((answer) => (
          <TableRow key={answer.uid}>
            <TableCell className="font-medium">{answer.playerName}</TableCell>
            <TableCell><AnswerCell answer={answer} /></TableCell>
            <TableCell className="text-neutral-400">
              {answer.timeMs > 0 && `${(answer.timeMs / 1000).toFixed(1)}s`}
              {answer.timeMs === 0 && "-"}
            </TableCell>
            <TableCell>{answer.livesUsed > 0 && answer.livesUsed}{answer.livesUsed === 0 && "-"}</TableCell>
            <TableCell>
              {answer.isReadyForNextRound && <Badge variant={BADGE_VARIANTS.GREEN}>Ready</Badge>}
              {!answer.isReadyForNextRound && <span className="text-neutral-600">-</span>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </section>
)

const Page = () => {
  const pathname = usePathname()
  const lobbyId = getLobbyIdFromPathname(pathname)

  const { data: lobby, isLoading: lobbyLoading } = useSubscribeLobbyQuery(
    { id: lobbyId },
    { skip: !lobbyId },
  )

  const { data: rounds, isLoading: roundsLoading } = useSubscribeAllRoundAnswersQuery(
    { lobbyId, numberOfRounds: lobby?.config.numberOfRounds || 0 },
    { skip: !lobby || lobby.status === LOBBY_STATUS.WAITING },
  )

  if (lobbyLoading) return <main className="p-4"><p>Loading...</p></main>

  if (!lobby) return <main className="p-4"><p>Lobby not found</p></main>

  return (
    <main className="p-4 min-h-full-height-admin">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={PAGES.ADMIN_LOBBIES}
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          &larr; Back to lobbies
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <h1 className="text-2xl font-semibold">
          Lobby <span className="font-mono">{lobby.code}</span>
        </h1>
        <Badge variant={getBadgeVariantLobbyStatus(lobby.status)}>{lobby.status}</Badge>
        {lobby.isDemo && <Badge variant={BADGE_VARIANTS.PURPLE}>Demo</Badge>}
      </div>

      {/* Lobby info */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
        <div>
          <p className="text-neutral-500">Players</p>
          <p>{lobby.players.length} / {lobby.config.maxPlayers}</p>
        </div>
        <div>
          <p className="text-neutral-500">Round</p>
          <p>{lobby.currentRound} / {lobby.config.numberOfRounds}</p>
        </div>
        <div>
          <p className="text-neutral-500">Duration</p>
          <p>{lobby.config.roundDuration}s</p>
        </div>
        <div>
          <p className="text-neutral-500">Lives</p>
          <p>{lobby.config.playersLives || "Unlimited"}</p>
        </div>
        <div>
          <p className="text-neutral-500">Created</p>
          <p>{formatTimestamp(lobby.createdAt)}</p>
        </div>
        <div>
          <p className="text-neutral-500">Special Rounds</p>
          <p>{lobby.config.hasSpecialRounds && "Yes"}{!lobby.config.hasSpecialRounds && "No"}</p>
        </div>
      </section>

      {/* Players scoreboard */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Players</h2>
        <Table noWrapper={false}>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Avatar</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Ready</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lobby.players.map((player) => (
              <TableRow key={player.uid}>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell className="text-neutral-400">{player.avatar}</TableCell>
                <TableCell>{player.score}</TableCell>
                <TableCell>
                  {player.isHost && <Badge variant={BADGE_VARIANTS.ORANGE}>Host</Badge>}
                  {!player.isHost && "-"}
                </TableCell>
                <TableCell>
                  {player.isReady && <Badge variant={BADGE_VARIANTS.GREEN}>Ready</Badge>}
                  {!player.isReady && "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* Rounds */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Rounds</h2>

        {lobby.status === LOBBY_STATUS.WAITING && (
          <p className="text-neutral-400">Game hasn&apos;t started yet</p>
        )}

        {roundsLoading && <p>Loading rounds...</p>}

        {rounds?.map((round) => (
          <RoundSection
            key={round.id}
            round={round}
            isCurrent={round.roundIndex === lobby.currentRound}
          />
        ))}
      </section>
    </main>
  )
}

export default Page
